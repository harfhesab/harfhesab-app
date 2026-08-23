import React, { memo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableNativeFeedback,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Animated,
{
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import SimpleBorderText from '../../text-components/SimpleBorderText';

function StageNumberCurrently({
  text,
  boxSize,
  onPress,
  fontSize,
  margin
}) {
    const colors = useAppTheme();

    const size = useSharedValue(25);
    const rotateZ = useSharedValue(0);
    
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
          { scale: size.value / 25 }
        ],
    }));
    
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    
    useEffect(() => {
        let isMounted = true;
    
        const loopAnimations = async () => {
          while (isMounted) {
            size.value = withSequence(
              withSpring(30, { stiffness: 280, damping: 5, mass: 0.8, overshootClamping: false }),
            );
            await wait(1200);
            size.value = withSequence(
              withSpring(25, { stiffness: 280, damping: 5, mass: 0.8, overshootClamping: false })
            );
            await wait(1200);
          }
        };
    
        loopAnimations();
    
        return () => {
          isMounted = false;
        };
    }, []);
        

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{width:boxSize, height:boxSize, alignItems:'center', justifyContent:'center', borderRadius:15, margin:margin}}>
                <ImageBackground
                    source={require("../../../assets/image/square_green.png")}
                    style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{borderRadius:15, width:"100%", height:"100%", alignItems:'center', justifyContent:'center'}}>
                        <SimpleBorderText
                            text={`${text}`}
                            width={boxSize}
                            height={fontSize*1.6}
                            fontSize={fontSize}
                            textColor={colors.primary.a5}
                            borderColor={colors.primary.a2}
                        />
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </Animated.View>
    );
}

const areEqual = (prevProps, nextProps) => {
  return true;
};
export default memo(StageNumberCurrently, areEqual);
