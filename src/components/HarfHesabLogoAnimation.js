import React, { memo, useEffect } from "react";
import { View } from "react-native";
import Animated,
{
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import LocalImageComponent from "./image-components/LocalImageComponent";

function HarfHesabLogoAnimation({ animate }) {
  const size = useSharedValue(25);
  const rotateZ = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: size.value / 25 }, // تغییر scale بجای تغییر width/height
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    let isMounted = true;

    const loopAnimations = async () => {
      while (isMounted && animate) {
        // 1) اول 45 درجه به سمت راست
        rotateZ.value = withTiming(45, { duration: 600 });
        await wait(600);

        // 2) بعد 45 درجه به سمت چپ
        rotateZ.value = withTiming(-45, { duration: 1200 });
        await wait(1200);

        // 3) برگرده عمودی
        rotateZ.value = withTiming(0, { duration: 600 });
        await wait(600);

        // 4) انیمیشن بزرگ و کوچک شدن
        size.value = withSequence(
          withSpring(30, { damping: 8, stiffness: 120 }),
          withSpring(25, { damping: 8, stiffness: 120 })
        );

        await wait(2000); // مکث قبل از تکرار
      }
    };

    if (animate) {
      loopAnimations();
    } else {
      // ریست و توقف انیمیشن
      cancelAnimation(size);
      cancelAnimation(rotateZ);
      size.value = 25;
      rotateZ.value = 0;
    }

    return () => {
      isMounted = false;
    };
  }, [animate]);

  return (
    <View
      style={{
        width: 120,
        height: 120,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View style={animatedStyle}>
        <LocalImageComponent
            path={require('../assets/image/icon.png')}
            width={120}
            height={120}
            resizeMode={'stretch'}
            blank_background={true}
          />
      </Animated.View>
    </View>
  );
}


export default memo(HarfHesabLogoAnimation);
