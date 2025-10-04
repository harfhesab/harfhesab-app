import React, { memo, useEffect } from "react";
import { View, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  cancelAnimation,
  useAnimatedProps,
  Easing,
} from "react-native-reanimated";
import useAppTheme from "../../hooks/theme/useAppTheme";
import { useSelector } from "react-redux";
import Icon from "../../utils/Icon";
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

// نسخه تایپ‌اسکریپت صحیح برای wait
const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });

function NumberCoins({
  onPress = () => {},
  transparent = 40,
}: {
  onPress?: () => void;
  transparent?: number;
}) {
  const colors = useAppTheme();
  
  const { numberCoins } = useSelector((state: any) => state.coins);

  const size = useSharedValue(25);
  const rotateY = useSharedValue(0);

  const animatedValue = useSharedValue<number>(numberCoins ?? 0);
  const isCounting = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: size.value,
      height: size.value,
      transform: [{ rotateY: `${rotateY.value}deg` }],
    };
  });

  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: formatWithSeparator(animatedValue.value),
    } as any;
  });

  // انیمیشن آرام پیش‌فرض سکه
  useEffect(() => {
    let isMounted = true;

    const loopAnimations = async () => {
      while (isMounted) {
        if (!isCounting.value) {
          size.value = withSequence(
            withSpring(30, { damping: 5, stiffness: 280, mass:0.8, overshootClamping:false }),
          );
          await wait(1200);
          size.value = withSequence(
            withSpring(25, { damping: 5, stiffness: 280, mass:0.8, overshootClamping:false })
          );
          await wait(2000);
          rotateY.value = withTiming(70, { duration: 1000 });
          await wait(2000);
          rotateY.value = withTiming(-70, { duration: 2000 });
          await wait(2000);
          rotateY.value = withTiming(0, { duration: 1000 });
          await wait(4000);
        } else {
          await wait(300); // وقتی شمارش فعاله، لوپ متوقف باشه
        }
      }
    };

    loopAnimations();
    return () => {
      isMounted = false;
    };
  }, []);

  // شمارش + انیمیشن چرخش
  useEffect(() => {
    const current = animatedValue.value;
    const target = typeof numberCoins === "number" ? numberCoins : 0;
    const diff = Math.abs(target - current);
    if (diff === 0) return;

    isCounting.value = true;

    // شروع چرخش سریع بی‌نهایت
    cancelAnimation(rotateY);
    rotateY.value = withRepeat(
      withTiming(360, { duration: 500, easing: Easing.linear }),
      -1,
      false
    );
    coinCountUpdateSound()
    animatedValue.value = withTiming(
      target,
      { duration: 1000, easing: Easing.out(Easing.quad) }, // ← کندتر و واضح‌تر
      (finished) => {
        if (finished) {
          isCounting.value = false;
          cancelAnimation(rotateY);

          // بعد از شمارش: فرفره‌وار بچرخه و کم‌کم کند بشه
          rotateY.value = withTiming(rotateY.value + 1440, {
            duration: 2000,
            easing: Easing.out(Easing.quad),
          });
        }
      }
    );
  }, [numberCoins]);

  const onClick = () => {
    onPress?.();
    navigate("CoinPlans")
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onClick}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: `${colors.primary.a1}${transparent}`,
            borderColor: colors.border.a1,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Icon
            name={"plus-square-o"}
            type={"FontAwesome"}
            style={{ fontSize: 25, color: "#ff9800" }}
          />
        </View>

        <AnimatedTextInput
          editable={false}
          underlineColorAndroid="transparent"
          animatedProps={animatedTextProps}
          defaultValue={priceDigitSeperator(String(numberCoins ?? 0))}
          style={{
            fontFamily: Font.black,
            fontSize: numberCoins.toString().length > 5?12:numberCoins.toString().length>4?13:15,
            color: colors.text.a1,
            padding: 0,
            textAlign: "center",
          }}
        />

        <View style={styles.coinWrapper}>
          <Animated.Image
            style={animatedStyle}
            source={require("../../assets/image/coin.png")}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingStart: 5,
    paddingEnd: 5,
    width: 120,
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  coinWrapper: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(NumberCoins);
