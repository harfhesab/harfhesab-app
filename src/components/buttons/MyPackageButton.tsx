import React, {useEffect, memo} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
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
                withSpring(45, { damping: 5, stiffness: 280, mass:0.8, overshootClamping:false }),
              );
              await wait(2000);
              size.value = withSequence(
                withSpring(35, { damping: 5, stiffness: 280, mass:0.8, overshootClamping:false })
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
        <TouchableOpacity activeOpacity={0.96} onPress={onPress} style={{width:180, height:65, shadowColor:"#00000090", elevation:5, zIndex:1000, borderWidth:1, borderColor:colors.border.a1, borderRadius:30}}>
            <LinearGradient colors={['#1b0b63', '#311b92', '#512da8']} style={{borderRadius:29, width:"100%", height:"100%"}}>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:20, width:"100%", height:"100%", paddingHorizontal:10}}>
                    <View style={styles.iconWrapper}>
                        <Animated.Image
                            style={animatedStyle}
                            source={require("../../assets/image/my-package.png")}
                        />
                    </View>
                    <Text style={{fontSize:14, fontFamily:Font.iran_yekan_bold, color:"#FFFFFF"}}>{"بازی‌های من"}</Text>
                </View>
            </LinearGradient>
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