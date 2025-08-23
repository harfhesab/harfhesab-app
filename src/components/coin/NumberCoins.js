import React, { memo, useEffect } from "react";
import { View, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import useAppTheme from "../../hooks/theme/useAppTheme";
import { useSelector } from "react-redux";
import Icon from "../../utils/Icon";
import Font from "../../utils/Font";
import { priceDigitSeperator } from "../../utils/PriceDigitSeperator";

function NumberCoins({ onPress = () => {}, transparent = 40 }) {
  const colors = useAppTheme();
  const { numberCoins } = useSelector((state) => state.coins);

  const size = useSharedValue(25);
  const rotateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    width: size.value,
    height: size.value,
    transform: [{ rotateY: `${rotateY.value}deg` }],
  }));

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    let isMounted = true;

    const loopAnimations = async () => {
      while (isMounted) {
        // 1) بزرگ و کوچک شدن
        size.value = withSequence(
          withSpring(30, { damping: 8, stiffness: 120 }),
          withSpring(25, { damping: 8, stiffness: 120 })
        );

        await wait(2000); // مکث ۲ ثانیه

        // 2) پشت و رو شدن به آرامی
        rotateY.value = withTiming(180, { duration: 2000 }); // رفت آرام
        await wait(2000);
        rotateY.value = withTiming(0, { duration: 2000 }); // برگشت آرام
        await wait(2000);

        await wait(2000); // مکث ۲ ثانیه بعد از چرخش
      }
    };

    loopAnimations();

    return () => {
      isMounted = false;
    };
  }, []);

  const onClick = () => {
    onPress?.();
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onClick}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingStart: 10,
          paddingEnd: 5,
          width: 140,
          backgroundColor: `${colors.primary.a1}${transparent}`,
          borderWidth: 1,
          borderRadius: 8,
          borderColor: colors.border.a1,
          height: 40
        }}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Icon
            name={"plus-square-o"}
            type={"FontAwesome"}
            style={{ fontSize: 25, color: "#ff9800" }}
          />
        </View>
        <Text style={{ fontFamily: Font.black, fontSize: 15, color: colors.text.a1 }}>
          {priceDigitSeperator(numberCoins)}
        </Text>
        <View style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.Image
            style={animatedStyle}
            source={require('../../assets/image/coin.png')}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const areEqual = (prevProps, nextProps) => {
  if (prevProps.onPress !== nextProps.onPress) return false;
  return true;
};
export default memo(NumberCoins, areEqual);
