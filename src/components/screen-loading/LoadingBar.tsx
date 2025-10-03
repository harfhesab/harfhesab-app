import React, { useEffect } from "react";
import { StyleSheet, Dimensions, I18nManager } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LoadingBarProps {
  barColor?: string;
  barWidthStart?: number; // عرض اولیه بار (درصد از صفحه، 0..1) - کوچک
  barWidthEnd?: number;   // عرض حداکثری بار (درصد از صفحه، 0..1) - بزرگ
  height?: number;
  width?: number;
  backgroundColor?: string;
  duration?: number;      // مدت زمان انیمیشن اصلی برای حالت لودینگ
  isComplete?: boolean;   // آیا لودینگ کامل شده؟ (پیش‌فرض false)
  completeDuration?: number; // مدت زمان پر شدن نهایی وقتی isComplete=true
  onComplete?: () => void; // callback اختیاری برای وقتی پر شدن تموم شد
}

const LoadingBar: React.FC<LoadingBarProps> = ({
  barColor = "#1976D2",
  barWidthStart = 0.25,    // شروع کوچک
  barWidthEnd = 0.6,      // حداکثر در وسط
  height = 10,
  width = SCREEN_WIDTH,
  backgroundColor = "#f0f0f0",
  duration = 1500,
  isComplete = false,     // پیش‌فرض false (حالت لودینگ)
  completeDuration = 1500, // پیش‌فرض 1 ثانیه برای پر شدن نهایی
  onComplete,
}) => {
  const progress = useSharedValue(0); // پیشرفت از 0 به 1

  useEffect(() => {
    if (!isComplete) {
      // حالت لودینگ indeterminate: تکراری از 0 به 1، reset فوری
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration,
            easing: Easing.linear,
          }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );
    } else {
      // حالت کامل شدن: cancel انیمیشن قبلی اگر در حال اجراست
      cancelAnimation(progress);
      // reset فوری به 0، سپس انیمیت به 1 در completeDuration، با callback در پایان
      progress.value = withSequence(
        withTiming(0, { duration: 0 }), // reset فوری به 0 برای شروع از چپ با عرض 0
        withTiming(
          1,
          {
            duration: completeDuration,
            easing: Easing.inOut(Easing.ease), // easing نرم برای پر شدن نهایی
          },
          () => {
            if (onComplete) {
              runOnJS(onComplete)();
            }
          }
        )
      );
    }
  }, [isComplete, duration, completeDuration, onComplete]); // وابستگی به propsها برای بروزرسانی

  const animatedStyle = useAnimatedStyle(() => {
    let translateXVal;
    let widthVal;
    let opacityVal;

    if (!isComplete) {
      // حالت لودینگ: حرکت translateX از کامل بیرون چپ به بیرون راست
      translateXVal = interpolate(
        progress.value,
        [0, 1],
        [-width, width] // شروع از کامل بیرون چپ، پایان در بیرون راست
      );
      widthVal = interpolate(
        progress.value,
        [1, 0.5, 1],
        [barWidthEnd, barWidthStart, barWidthEnd]
      ) * width;
      opacityVal = interpolate(
        progress.value,
        [0, 0.5, 1],
        [0.7, 1, 0.7]
      );
    } else {
      // حالت کامل شدن: بدون translate (ثابت از چپ شروع)، عرض از 0 به full، opacity ثابت 1
      translateXVal = 0;
      widthVal = interpolate(
        progress.value,
        [0, 1],
        [0, width]
      );
      opacityVal = 1;
    }

    return {
      transform: [{ translateX: translateXVal }],
      width: widthVal,
      opacity: opacityVal,
    };
  });

  return (
    <Animated.View style={[styles.container, { height, width, backgroundColor, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          animatedStyle,
          {
            height: "100%",
            backgroundColor: barColor,
            position: "absolute",
            left: 0,
            borderRadius: height / 2,
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    direction: I18nManager.isRTL?"ltr":"rtl"
  },
});

export default LoadingBar;