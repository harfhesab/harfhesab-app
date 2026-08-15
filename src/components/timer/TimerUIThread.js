import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useFrameCallback,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

Animated.addWhitelistedNativeProps({ text: true });

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// نسخه‌ی worklet — فقط داخل UI thread / frame callback استفاده می‌شود.
const pad2 = (n) => {
  'worklet';
  return n < 10 ? `0${n}` : `${n}`;
};

// نسخه‌ی معمولی JS (غیر worklet) — همین‌جا، حین render، برای ساختن
// defaultValue استفاده می‌شود. چون هیچ shared value ای نمی‌خواند،
// خواندنش در طول render هیچ وارنینگی تولید نمی‌کند.
const pad2Plain = (n) => (n < 10 ? `0${n}` : `${n}`);

const toTotalSeconds = ({ seconds = 0, minutes = 0, hours = 0, days = 0 }) =>
  seconds + minutes * 60 + hours * 3600 + days * 86400;

/**
 * A single digit group. Renders through an uneditable TextInput whose text
 * is bound via animatedProps, so updates never go through React/JS thread.
 *
 * `initialText` is a *plain* string computed by the parent using plain JS
 * (not by reading a shared value's `.value` during render) and is only
 * used as the native `defaultValue`, so the view never mounts empty.
 */
function Digit({ sharedText, initialText, style }) {
  const animatedProps = useAnimatedProps(() => ({
    text: sharedText.value,
  }));

  return (
    <AnimatedTextInput
      style={style}
      animatedProps={animatedProps}
      defaultValue={initialText}
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
  // اختیاری: یک shared value بولی. وقتی paused.value === true بشود،
  // تایمر متوقف می‌شود و وقتی دوباره false بشود، از همان نقطه‌ی
  // متوقف‌شده به شمارش ادامه می‌دهد.
  paused = useSharedValue(false),
}) {
  const showHours = hours !== undefined && hours !== null;
  const showDays = days !== undefined && days !== null;

  const initialTotalMs = toTotalSeconds({ seconds, minutes, hours, days }) * 1000;

  // Absolute end time in epoch-ms — the source of truth for the countdown.
  const endAt = useSharedValue(Date.now() + initialTotalMs);

  // زمان باقی‌مانده (به میلی‌ثانیه) در لحظه‌ای که پاز اتفاق می‌افتد،
  // یا مقدار اولیه‌ی کل زمان اگر تایمر از همون اول paused شروع بشه.
  const pausedRemainingMs = useSharedValue(initialTotalMs);

  const secondsSV = useSharedValue(pad2Plain(seconds));
  const minutesSV = useSharedValue(pad2Plain(minutes));
  const hoursSV = useSharedValue(showHours ? pad2Plain(hours) : '00');
  const daysSV = useSharedValue(showDays ? String(days) : '0');

  const lastRenderedSecond = useSharedValue(-1);
  const finished = useSharedValue(false);

  // Keep the latest onFinish without ever touching this ref from a worklet.
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const handleFinish = useCallback(() => {
    onFinishRef.current?.();
  }, []);

  // Re-arm whenever the parent passes a new target (e.g. restarting the
  // countdown for a new round of the game).
  useEffect(() => {
    const totalMs = toTotalSeconds({ seconds, minutes, hours, days }) * 1000;
    endAt.value = Date.now() + totalMs;
    pausedRemainingMs.value = totalMs;
    finished.value = false;
    lastRenderedSecond.value = -1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, minutes, hours, days]);

  // واکنش به تغییر paused.value:
  // - لحظه‌ی true شدن: زمان باقی‌مانده را ذخیره می‌کنیم (فریز).
  // - لحظه‌ی false شدن: endAt را نسبت به «الان» با همان زمان باقی‌مانده بازسازی می‌کنیم.
  useAnimatedReaction(
    () => paused.value,
    (isPaused, prevIsPaused) => {
      if (prevIsPaused === null || isPaused === prevIsPaused) return;
      if (finished.value) return;

      if (isPaused) {
        pausedRemainingMs.value = Math.max(0, endAt.value - Date.now());
      } else {
        endAt.value = Date.now() + pausedRemainingMs.value;
        // فورس رندر فوری فریم بعدی، حتی اگر ثانیه‌ی نمایشی عوض نشده باشد.
        lastRenderedSecond.value = -1;
      }
    },
    [paused]
  );

  useFrameCallback((_frame) => {
    'worklet';
    if (finished.value) return;
    if (paused.value) return; // وقتی پاز است، هیچ محاسبه‌ای انجام نمی‌شود.

    const remainingMs = endAt.value - Date.now();
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    if (remainingSec === lastRenderedSecond.value) return;
    lastRenderedSecond.value = remainingSec;

    secondsSV.value = pad2(remainingSec % 60);
    minutesSV.value = pad2(Math.floor(remainingSec / 60) % 60);
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

  const initialTexts = useMemo(
    () => ({
      seconds: pad2Plain(seconds),
      minutes: pad2Plain(minutes),
      hours: showHours ? pad2Plain(hours) : '00',
      days: showDays ? String(days) : '0',
    }),
    [seconds, minutes, hours, days, showHours, showDays]
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
    units.push({ sv: secondsSV, initial: initialTexts.seconds });
    units.push({ sv: minutesSV, initial: initialTexts.minutes });
    if (showHours) units.push({ sv: hoursSV, initial: initialTexts.hours });
    if (showDays) units.push({ sv: daysSV, initial: initialTexts.days });

    return (
      <View style={styles.inlineRow}>
        {units.map((u, index) => (
          <React.Fragment key={index}>
            <Digit sharedText={u.sv} initialText={u.initial} style={digitStyle} />
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
        <Digit sharedText={secondsSV} initialText={initialTexts.seconds} style={digitStyle} />
        {!hideTitle && <Text style={labelStyle}>{'ثانیه'}</Text>}
      </View>
      <View style={boxStyle}>
        <Digit sharedText={minutesSV} initialText={initialTexts.minutes} style={digitStyle} />
        {!hideTitle && <Text style={labelStyle}>{'دقیقه'}</Text>}
      </View>
      {showHours && (
        <View style={boxStyle}>
          <Digit sharedText={hoursSV} initialText={initialTexts.hours} style={digitStyle} />
          {!hideTitle && <Text style={labelStyle}>{'ساعت'}</Text>}
        </View>
      )}
      {showDays && (
        <View style={boxStyle}>
          <Digit sharedText={daysSV} initialText={initialTexts.days} style={digitStyle} />
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