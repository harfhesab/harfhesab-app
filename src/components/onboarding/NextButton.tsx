import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import LocalImageComponent from '../image-components/LocalImageComponent';
import Font from '../../utils/Font';
import { colors } from '../../hooks/theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface NextButtonProps {
  percentage: number;
  scrollTo: () => void;
  isRTL: boolean;
  color?: string;
  isLastSlide?: boolean;
}

export const NextButton: React.FC<NextButtonProps> = ({ 
  percentage, 
  scrollTo, 
  isRTL,
  color = colors.primary.a3, 
  isLastSlide 
}) => {
  const size = 68;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 250 });
  }, [percentage, progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (circumference * progress.value) / 100;
    return { strokeDashoffset };
  });


  return (
    <View style={{flexDirection:'row', alignItems:'center', gap:20}}>
        <View style={styles.container}>
            <Svg width={size} height={size} style={styles.svg}>
                <G rotation="-90" origin={`${center}, ${center}`}>
                <Circle stroke="#E6E7E9" cx={center} cy={center} r={radius} strokeWidth={strokeWidth} />
                <AnimatedCircle
                    stroke={color}
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                />
                </G>
            </Svg>
            <TouchableOpacity activeOpacity={0.85} onPress={scrollTo}>
                <LocalImageComponent
                    path={isLastSlide?require("../../assets/image/tick.png"):require("../../assets/image/back.png")}
                    width={50}
                    height={50}
                    resizeMode={'cover'}
                    blank_background
                />
            </TouchableOpacity>
        </View>
        <Text style={{fontFamily:Font.bakh_bold, color:colors.primary.a2, fontSize:14}}>{isLastSlide?"ورود به بازی":"بعدی"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  svg: { position: 'absolute' },
  button: { position: 'absolute', borderRadius: 100, padding: 16 },
});