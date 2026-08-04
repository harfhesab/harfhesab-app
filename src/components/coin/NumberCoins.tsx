import React, { memo, useEffect, useRef } from "react";
import { View, TouchableOpacity, TextInput, StyleSheet, ImageBackground } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  cancelAnimation,
  useAnimatedProps,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import Font from "../../utils/Font";
import { coinCountUpdateSound } from "../../utils/sound/SoundFunctions";
import { priceDigitSeperator } from "../../utils/PriceDigitSeperator";
import { navigate } from "../../main/navigationService";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function formatWithSeparator(n: number): string {
  "worklet";
  const num = Math.floor(Math.max(0, n));
  const s = String(num);
  let out = "";
  let count = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    out = s[i] + out;
    count++;
    if (count % 3 === 0 && i !== 0) out = "," + out;
  }
  return out;
}

interface NumberCoinsProps {
  onPress?: () => void;
}

function NumberCoins({ onPress = () => {} }: NumberCoinsProps) {
  const { numberCoins } = useSelector((state: any) => state.coins);

  const scale = useSharedValue(1.25);
  const rotateY = useSharedValue(0);

  const animatedValue = useSharedValue<number>(numberCoins ?? 0);
  const isCounting = useRef(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateY: `${rotateY.value}deg` }
      ],
    };
  });

  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: formatWithSeparator(animatedValue.value),
    } as any;
  });

  // تابع Idle کاملاً امن در لایه JS
  const startIdleAnimation = () => {
    if (isCounting.current) return;

    scale.value = withRepeat(
      withSequence(
        withSpring(1.25, { damping: 5, stiffness: 280, mass: 0.8, overshootClamping: false }),
        withDelay(1200, withSpring(1.0, { damping: 5, stiffness: 280, mass: 0.8, overshootClamping: false })),
        withDelay(12000, withTiming(1.0, { duration: 0 }))
      ),
      -1,
      false
    );

    rotateY.value = withRepeat(
      withSequence(
        withDelay(3200, withTiming(70, { duration: 1000 })),
        withDelay(2000, withTiming(-70, { duration: 2000 })),
        withDelay(2000, withTiming(0, { duration: 1000 })),
        withDelay(4000, withTiming(0, { duration: 0 }))
      ),
      -1,
      false
    );
  };

  // تعریف یک تابع جداگانه در JS Thread برای جلوگیری از کرش Worklet
  const finishCounting = () => {
    isCounting.current = false;
    startIdleAnimation();
  };

  useEffect(() => {
    startIdleAnimation();
    return () => {
      cancelAnimation(scale);
      cancelAnimation(rotateY);
    };
  }, []);

  useEffect(() => {
    const current = animatedValue.value;
    const target = typeof numberCoins === "number" ? numberCoins : 0;
    const diff = Math.abs(target - current);
    
    if (diff === 0) return;

    isCounting.current = true;

    cancelAnimation(scale);
    cancelAnimation(rotateY);
    scale.value = 1;

    rotateY.value = withRepeat(
      withTiming(360, { duration: 500, easing: Easing.linear }),
      -1,
      false
    );

    coinCountUpdateSound();

    animatedValue.value = withTiming(
      target,
      { duration: 1000, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished) {
          cancelAnimation(rotateY);

          rotateY.value = withTiming(
            rotateY.value + 1440,
            { duration: 2000, easing: Easing.out(Easing.quad) },
            (rotFinished) => {
              if (rotFinished) {
                // فراخوانی امن تابعِ JS از درون Worklet
                runOnJS(finishCounting)();
              }
            }
          );
        }
      }
    );
  }, [numberCoins]);

  const onClick = () => {
    onPress?.();
    navigate("CoinPlans");
  };

  const coinStr = String(numberCoins ?? 0);
  const fontSize = coinStr.length > 5 ? 13 : coinStr.length > 4 ? 14 : 16;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onClick}>
      <ImageBackground
        source={require("../../assets/image/frame_coin.png")}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
        resizeMode="stretch"
      >
        <View style={styles.container}>
          <View style={styles.textWrapper}>
            <AnimatedTextInput
              editable={false}
              underlineColorAndroid="transparent"
              animatedProps={animatedTextProps}
              defaultValue={priceDigitSeperator(coinStr)}
              style={[styles.textInput, { fontSize }]}
            />
          </View>

          <View style={styles.coinWrapper}>
            <Animated.Image
              style={[styles.coinImage, animatedStyle]}
              source={require("../../assets/image/coin.png")}
            />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: 115,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  imageStyle: {
    resizeMode: "stretch",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
    paddingEnd: 9,
    paddingStart: 25,
  },
  textWrapper: {
    width: 50,
    alignItems: "center",
  },
  textInput: {
    fontFamily: Font.bakh_bold,
    color: "#FFFFFF",
    padding: 0,
    textAlign: "center",
  },
  coinWrapper: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 2,
  },
  coinImage: {
    width: 20,
    height: 20,
  },
});

export default memo(NumberCoins);