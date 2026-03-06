import React, { memo, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, ImageBackground, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import Font from "../../utils/Font";



const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });

function SubscriptionInfoBtn({
  onPress = () => {},
}: {
  onPress?: () => void;
}) {
  
  const { subscriptionExpiration, activeSubscription} = useSelector((state: any) => state.subscription);
  let numberDays
  if(activeSubscription == true){
    const perDayTime = 86400000
    const nowTime = Date.now()
    const expirationTime = new Date(subscriptionExpiration).getTime()
    const numbers = (expirationTime - nowTime) / perDayTime
    numberDays = numbers.toFixed(1)
  } else {
    numberDays = 0
  }

  const size = useSharedValue(25);


  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: size.value,
      height: size.value,
    };
  });



  // انیمیشن آرام پیش‌فرض سکه
  useEffect(() => {
    let isMounted = true;

    const loopAnimations = async () => {
      while (isMounted) {
        size.value = withSequence(
          withSpring(25, { damping: 5, stiffness: 280, mass:0.8, overshootClamping:false }),
        );
        await wait(1200);
        size.value = withSequence(
          withSpring(20, { damping: 5, stiffness: 280, mass:0.8, overshootClamping:false })
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
    // navigate("CoinPlans")
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onClick}>
      <ImageBackground
          source={require("../../assets/image/frame_coin.png")}
          style={{ width: 115, height: 40, justifyContent: "center", alignItems: "center" }}
          imageStyle={{ resizeMode: "stretch" }}
          resizeMode="stretch"
      >
        <View
            style={styles.container}
          >
            
            <View style={{width:50, alignItems:'center'}}>
              <Text style={{fontFamily:Font.medium, fontSize:10, color:"#FFFFFF"}}>{`${numberDays} روز`}</Text>
            </View>
            

            <View style={styles.diamondWrapper}>
              <Animated.Image
                style={animatedStyle}
                source={require("../../assets/image/diamond.png")}
              />
            </View>
          </View>
      </ImageBackground>
      
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
    paddingEnd:9,
    paddingStart:25,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  diamondWrapper: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(SubscriptionInfoBtn);
