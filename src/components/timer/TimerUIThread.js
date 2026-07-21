import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useFrameCallback,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

/**
 * High-performance countdown timer for React Native.
 *
 * Why this exists:
 * The original implementation ticked via `setState` on the JS thread every
 * second. On heavy screens (Skia canvases, many Reanimated worklets, gesture
 * handlers) the JS thread gets congested, so JS timers get delayed/skipped
 * and every tick triggers a full React re-render -> visible stutter.
 *
 * This version:
 *  1. Ticks on the UI thread via `useFrameCallback`, which keeps running
 *     smoothly even when the JS thread is busy.
 *  2. Tracks an absolute end timestamp (Date.now()-based) instead of
 *     decrementing a counter, so it self-corrects after dropped frames,
 *     JS-thread stalls, or the app being backgrounded — it can never drift.
 *  3. Writes the digits directly into native TextInput views through
 *     `useAnimatedProps` ("text on the UI thread" trick), so ticking NEVER
 *     triggers a React re-render. Only genuine prop changes from the parent
 *     (restarting the countdown) cause a re-render.
 *  4. Only touches shared values when the *displayed* second actually
 *     changes, not on every single frame.
 *
 * Extra props:
 *  - hideTitle (boolean, default false): hides the unit labels
 *    (ثانیه/دقیقه/ساعت/روز) under each digit group. Only affects the
 *    default boxed layout.
 *  - separator (string, optional): switches to a compact inline layout,
 *    joining the units (largest -> smallest, only the ones provided) with
 *    this string, e.g. separator=":" -> "10:15:58". No labels are shown
 *    in this mode.
 */

// Defensive: on some Reanimated/RN version combinations (mainly older
// Android setups) the "text" prop needs to be explicitly whitelisted for
// useAnimatedProps to be allowed to write it natively. In current
// Reanimated 3 this is usually handled automatically, but whitelisting it
// again is a harmless no-op and removes any doubt.
Animated.addWhitelistedNativeProps({ text: true });

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const pad2 = (n) => {
  'worklet';
  return n < 10 ? `0${n}` : `${n}`;
};

const toTotalSeconds = ({ seconds = 0, minutes = 0, hours = 0, days = 0 }) =>
  seconds + minutes * 60 + hours * 3600 + days * 86400;

/**
 * A single digit group. Renders through an uneditable TextInput whose text
 * is bound via animatedProps, so updates never go through React/JS thread.
 */
function Digit({ sharedText, style }) {
  const animatedProps = useAnimatedProps(() => ({
    text: sharedText.value,
  }));

  return (
    <AnimatedTextInput
      style={style}
      animatedProps={animatedProps}
      defaultValue={sharedText.value}
      editable={false}
      focusable={false}
      caretHidden
      contextMenuHidden
      showSoftInputOnFocus={false}
      underlineColorAndroid="transparent"
      pointerEvents="none"
      allowFontScaling={false}
      accessibilityRole="text"
    />
  );
}

function TimerUIThread({
  seconds,
  minutes,
  hours,
  days,
  style,
  titleStyle,
  onFinish,
  hideTitle = false,
  separator,
}) {
  const showHours = hours !== undefined && hours !== null;
  const showDays = days !== undefined && days !== null;

  // Absolute end time in epoch-ms — the source of truth for the countdown.
  const endAt = useSharedValue(
    Date.now() + toTotalSeconds({ seconds, minutes, hours, days }) * 1000
  );

  const secondsSV = useSharedValue(pad2(seconds));
  const minutesSV = useSharedValue(pad2(minutes));
  const hoursSV = useSharedValue(showHours ? pad2(hours) : '00');
  const daysSV = useSharedValue(showDays ? String(days) : '0');

  const lastRenderedSecond = useSharedValue(-1);
  const finished = useSharedValue(false);

  // Keep the latest onFinish without ever touching this ref from a worklet.
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // A STABLE, plain JS-thread function. It's referenced by identifier
  // (not as `ref.current`) wherever we pass it to runOnJS, and it reads the
  // ref itself on the JS thread — so no ref/function ever needs to be
  // cloned into the UI thread closure.
  const handleFinish = useCallback(() => {
    onFinishRef.current?.();
  }, []);

  // Re-arm whenever the parent passes a new target (e.g. restarting the
  // countdown for a new round of the game).
  useEffect(() => {
    endAt.value = Date.now() + toTotalSeconds({ seconds, minutes, hours, days }) * 1000;
    finished.value = false;
    lastRenderedSecond.value = -1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, minutes, hours, days]);

  useFrameCallback((_frame) => {
    'worklet';
    if (finished.value) return;

    const remainingMs = endAt.value - Date.now();
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    // Skip all work unless the visible second actually changed.
    if (remainingSec === lastRenderedSecond.value) return;
    lastRenderedSecond.value = remainingSec;

    secondsSV.value = pad2(remainingSec % 60);
    minutesSV.value = pad2(Math.floor(remainingSec / 60) % 60);
    // Update unconditionally — writing to a shared value that isn't
    // currently rendered costs nothing, and this avoids ever depending on
    // a plain JS boolean (showHours/showDays) captured in this closure.
    hoursSV.value = pad2(Math.floor(remainingSec / 3600) % 24);
    daysSV.value = String(Math.floor(remainingSec / 86400));

    if (remainingSec <= 0) {
      finished.value = true;
    }
  }, true);

  useAnimatedReaction(
    () => finished.value,
    (isFinished, prevIsFinished) => {
      if (isFinished && !prevIsFinished) {
        runOnJS(handleFinish)();
      }
    },
    []
  );

  const { boxStyle, digitStyle, labelStyle } = useMemo(() => {
    const fontSize = style?.fontSize ?? 20;
    return {
      boxStyle: {
        flexDirection: 'column',
        alignItems: 'center',
        width: fontSize * 2,
        marginHorizontal: 2,
      },
      digitStyle: [style, { padding: 0, margin: 0, textAlign: 'center' }],
      labelStyle: [{ fontSize: fontSize / 2 }, titleStyle],
    };
  }, [style, titleStyle]);

  if (separator) {
    const units = [];
    units.push(secondsSV);
    units.push(minutesSV);
    if (showHours) units.push(hoursSV);
    if (showDays) units.push(daysSV);

    return (
      <View style={styles.inlineRow}>
        {units.map((sv, index) => (
          <React.Fragment key={index}>
            <Digit sharedText={sv} style={digitStyle} />
            {index < units.length - 1 && (
              <Text style={style}>{separator}</Text>
            )}
          </React.Fragment>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={boxStyle}>
        <Digit sharedText={secondsSV} style={digitStyle} />
        {!hideTitle && <Text style={labelStyle}>{'ثانیه'}</Text>}
      </View>
      <View style={boxStyle}>
        <Digit sharedText={minutesSV} style={digitStyle} />
        {!hideTitle && <Text style={labelStyle}>{'دقیقه'}</Text>}
      </View>
      {showHours && (
        <View style={boxStyle}>
          <Digit sharedText={hoursSV} style={digitStyle} />
          {!hideTitle && <Text style={labelStyle}>{'ساعت'}</Text>}
        </View>
      )}
      {showDays && (
        <View style={boxStyle}>
          <Digit sharedText={daysSV} style={digitStyle} />
          {!hideTitle && <Text style={labelStyle}>{'روز'}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  inlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

export default React.memo(TimerUIThread);