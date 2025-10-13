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
import TextGradientSvg from '../../text-components/TextGradientSvg';
import Animated,
{
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

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
                        <TextGradientSvg
                            text={`${text}`}
                            fontFamily={Font.bakh_extra_bold}
                            fontSize={fontSize}
                            colors={["#dce775", "#fcb900"]}
                            shadowColor={"#00000090"}
                            shadowBlur={5}
                            dropShadow={true}
                            borderColor={"#33333385"}
                            borderWidth={0.5}
                            glowBlur={100}
                            glowColor={'#fff5c8'}
                            glowShadow={true}
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
