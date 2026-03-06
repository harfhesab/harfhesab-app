import React, { memo, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, ImageBackground, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { navigate } from "../../main/navigationService";



const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });

function SubscriptionBtn({
  onPress = () => {},
}: {
  onPress?: () => void;
}) {
  
  const size = useSharedValue(28);


  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: size.value,
      height: size.value,
    };
  });


  useEffect(() => {
    let isMounted = true;

    const loopAnimations = async () => {
      while (isMounted) {
        size.value = withSequence(
          withSpring(28, { damping: 5, stiffness: 280, mass:0.8, overshootClamping:false }),
        );
        await wait(1200);
        size.value = withSequence(
          withSpring(22, { damping: 5, stiffness: 280, mass:0.8, overshootClamping:false })
        );
        await wait(2000);
      }
    };

    loopAnimations();
    return () => {
      isMounted = false;
    };
  }, []);

  const onClick = () => {
    onPress?.();
    navigate("SubscriptionPlans")
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
                source={require("../../assets/image/diamond.png")}
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

export default memo(SubscriptionBtn);
