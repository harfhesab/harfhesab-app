import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, LinearGradient, Rect, vec, SkPoint } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, useDerivedValue, withRepeat, Easing } from 'react-native-reanimated';

// تایپ‌ها برای پراپس‌های کامپوننت
interface MovementGradientLayerProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MovementGradientLayer: React.FC<MovementGradientLayerProps> = ({ width, height, children }) => {
  // متغیر انیمیشن برای تغییر موقعیت گرادیان
  const gradientProgress = useSharedValue(0);

  // انیمیشن تکرارشونده با withRepeat
  useEffect(() => {
    gradientProgress.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // تکرار بی‌نهایت
      true // معکوس کردن انیمیشن در هر تکرار
    );

    // تمیز کردن انیمیشن در زمان unmount
    return () => {
      gradientProgress.value = 0;
    };
  }, [gradientProgress]);

  // تعریف مقادیر مشتق‌شده برای start و end گرادیان
  const gradientStart = useDerivedValue(() => {
    return vec(0, gradientProgress.value * height);
  }, [gradientProgress, height]);

  const gradientEnd = useDerivedValue(() => {
    return vec(width, (1 - gradientProgress.value) * height);
  }, [gradientProgress, width, height]);

  return (
    <View style={[styles.container, { width, height }]}>
      {/* رندر بک‌گراند با Skia */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={['#70426a', '#6B7280', '#3B82F6', '#10B981', '#bbaf46ff']}
          />
        </Rect>
      </Canvas>
      {/* نمایش children در مرکز */}
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );
};

// استایل‌ها
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  childrenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MovementGradientLayer;