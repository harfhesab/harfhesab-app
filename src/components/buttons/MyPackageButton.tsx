import React, {useEffect, memo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ImageBackground} from 'react-native';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import useAppTheme from '../../hooks/theme/useAppTheme';
import LinearGradient from 'react-native-linear-gradient';
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

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
interface MyPackageButtonProps {
  onPress?: () => void;
}
const MyPackageButton: React.FC<MyPackageButtonProps> = ({
  onPress = ()=>{},
}) => {
    const colors = useAppTheme();

    const size = useSharedValue(35);
    const rotateY = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
        width: size.value,
        height: size.value,
        transform: [{ rotateY: `${rotateY.value}deg` }],
        };
    });

    useEffect(() => {
        let isMounted = true;
    
        const loopAnimations = async () => {
          while (isMounted) {
            size.value = withSequence(
                withSpring(38, { damping: 5, stiffness: 280, mass:0.8, overshootClamping:false }),
              );
              await wait(2000);
              size.value = withSequence(
                withSpring(28, { damping: 5, stiffness: 280, mass:0.8, overshootClamping:false })
              );
              await wait(2000);
            }
        };
    
        loopAnimations();
        return () => {
          isMounted = false;
        };
      }, []);
    return(
        <TouchableOpacity activeOpacity={0.96} onPress={onPress} style={{zIndex:1000}}>
            <ImageBackground
                    source={require("../../assets/image/rtl_thumb_frame.png")}
                    style={{ width: 200, height: 69.5, paddingBottom:2}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:"100%", height:"100%", paddingStart:13, paddingEnd:25}}>
                    <View style={styles.iconWrapper}>
                        <Animated.Image
                            style={animatedStyle}
                            source={require("../../assets/image/my-package.png")}
                        />
                    </View>
                    <Text style={{fontSize:12, fontFamily:Font.iran_yekan_bold, color:"#FFFFFF"}}>{"بسته‌های بازی من"}</Text>
                </View>
           </ImageBackground>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
export default memo(MyPackageButton);