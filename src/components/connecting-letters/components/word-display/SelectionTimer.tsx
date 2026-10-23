import React, { memo } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { interpolateColor, useDerivedValue } from 'react-native-reanimated';
import { Canvas, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';
import { useLettersStatic } from '../../context/LettersContext';
import { TIMER_COLORS } from '../../constants/theme';
import { onUIThread } from '../../utils/worklet';
import Icon from '../../../../utils/Icon';
import useAppTheme from '../../../../hooks/theme/useAppTheme';

const BUTTON_SIZE = 32;
const ICON_SIZE = 18;
const GAP = 8;
const BAR_HEIGHT = 16;
const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

const TimerButton = memo(function TimerButton({ icon, onPress }: { icon: string; onPress: () => void }) {
  const colors = useAppTheme();
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} hitSlop={HIT_SLOP}>
      <ImageBackground
        source={require('../../../../assets/image/free_button.png')}
        style={styles.button}
        imageStyle={styles.buttonImage}
      >
        <Icon name={icon} type="Feather" style={{ fontSize: ICON_SIZE, color: colors.primary.a5 }} />
      </ImageBackground>
    </TouchableOpacity>
  );
});

/**
 * زمان باقی‌مانده برای افزودن حرف بعدی؛ از سبز به قرمز خالی می‌شود. دکمه‌ی چپ آن را دوباره
 * پر می‌کند و دکمه‌ی راست کلمه را همان لحظه ثبت می‌کند.
 */
function SelectionTimer() {
  const { engine, metrics, restartTimer, submitNow } = useLettersStatic();
  const { countdown } = engine;
  const barWidth = Math.max(0, metrics.width - (BUTTON_SIZE + GAP) * 2);
  const inner = Math.max(0, barWidth - 4);
  const fillHeight = BAR_HEIGHT - 4;

  // روی JS (رندر اول) نوار خالی است؛ بدون خواندن countdown از UI thread.
  const fillWidth = useDerivedValue(() => (onUIThread() ? countdown.value * inner : 0));
  const fillColor = useDerivedValue(() =>
    onUIThread()
      ? interpolateColor(countdown.value, [0, 0.45, 1], [TIMER_COLORS.low, TIMER_COLORS.mid, TIMER_COLORS.high])
      : TIMER_COLORS.low,
  );

  return (
    <View style={[styles.row, { width: metrics.width }]}>
      <TimerButton icon="refresh-ccw" onPress={submitNow} />
      <Canvas style={{ width: barWidth, height: BAR_HEIGHT }}>
        <RoundedRect x={0} y={0} width={barWidth} height={BAR_HEIGHT} r={BAR_HEIGHT / 2} color={TIMER_COLORS.track} />
        <RoundedRect x={2} y={2} width={fillWidth} height={fillHeight} r={fillHeight / 2} color={fillColor} />
        <RoundedRect x={2} y={2} width={fillWidth} height={fillHeight} r={fillHeight / 2}>
          <LinearGradient
            start={vec(0, 2)}
            end={vec(0, 2 + fillHeight)}
            colors={[TIMER_COLORS.gloss, 'rgba(255, 255, 255, 0)', 'rgba(0, 0, 0, 0.18)']}
          />
        </RoundedRect>
        <RoundedRect
          x={0.5}
          y={0.5}
          width={barWidth - 1}
          height={BAR_HEIGHT - 1}
          r={(BAR_HEIGHT - 1) / 2}
          style="stroke"
          strokeWidth={1}
          color={TIMER_COLORS.trackLine}
        />
      </Canvas>
      <TimerButton icon="refresh-cw" onPress={restartTimer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: BUTTON_SIZE + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonImage: {
    resizeMode: 'stretch',
  },
});

export default memo(SelectionTimer);
