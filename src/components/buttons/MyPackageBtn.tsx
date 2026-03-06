import React, { memo, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, ImageBackground, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { navigate } from "../../main/navigationService";



const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });

function MyPackageBtn({
  onPress = () => {},
}: {
  onPress?: () => void;
}) {

  const rotateZ = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { rotateZ: `${rotateZ.value}deg` },
      ],
      width: 25,
      height: 25,
    }));



  useEffect(() => {
    let isMounted = true;

    const loopAnimations = async () => {
      while (isMounted) {
        // 1) اول 45 درجه به سمت راست
        rotateZ.value = withTiming(45, { duration: 600 });
        await wait(600);
        // 2) بعد 45 درجه به سمت چپ
        rotateZ.value = withTiming(-45, { duration: 1200 });
        await wait(1200);
        // 3) برگرده عمودی
        rotateZ.value = withTiming(0, { duration: 600 });
        await wait(600);
        await wait(2000); // مکث قبل از تکرار
      }
    };

    loopAnimations();
    return () => {
      isMounted = false;
    };
  }, []);

  const onClick = () => {
    onPress?.();
    navigate("UserPackagesList")
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onClick}>
      <ImageBackground
          source={require("../../assets/image/free_button.png")}
          style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center" }}
          imageStyle={{ resizeMode: "stretch" }}
          resizeMode="stretch"
      >
        <View style={styles.container}>
            <Animated.Image
                style={animatedStyle}
                source={require("../../assets/image/my-package.png")}
              />
          </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
});

export default memo(MyPackageBtn);
