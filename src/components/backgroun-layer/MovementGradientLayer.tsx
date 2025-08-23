import React, { useEffect, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, LinearGradient, Rect, vec, SkPoint } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, useDerivedValue, withRepeat, Easing } from 'react-native-reanimated';

// تایپ‌ها برای پراپس‌های کامپوننت
interface MovementGradientLayerProps {
  width: number;
  height: number;
  borderRadius?: number;
  colors?: string[];
  children?: React.ReactNode;
}


const MovementGradientLayer: React.FC<MovementGradientLayerProps> = ({ width, height, colors, children, borderRadius=0 }) => {
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
    <View style={[styles.container, { width, height, borderRadius }]}>
      {/* رندر بک‌گراند با Skia */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={colors??['#d32f2f85', '#f57c0085', '#03a9f485', '#388e3c85']}
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  childrenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const areEqual = (prevProps:any, nextProps:any) => {
  if (prevProps.children !== nextProps.children) return false;
  if (prevProps.width !== nextProps.width) return false;
  if (prevProps.height !== nextProps.height) return false;
  if (prevProps.colors !== nextProps.colors) return false;
  if (prevProps.borderRadius !== nextProps.borderRadius) return false;
  return true;
};
export default memo(MovementGradientLayer, areEqual);