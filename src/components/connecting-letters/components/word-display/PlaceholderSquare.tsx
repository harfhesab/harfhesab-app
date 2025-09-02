import React, {useEffect} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import Font from '../../../../utils/Font';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import TextGradientSvg from '../../../text-components/TextGradientSvg';

interface PlaceholderSquareProps {
  letter: string;
  isRevealed: boolean;
  size: number;
  mainWord: boolean;
  helped?: boolean;
}
const PlaceholderSquare = ({ letter, isRevealed, size, mainWord, helped = false }: PlaceholderSquareProps) => {
    const colors = useAppTheme();
    const backgroundColor1 = mainWord ? `rgba(14, 169, 96, 0.2)` : `rgba(6, 147, 227, 0.2)`;
    const backgroundColor2 = mainWord ? `rgba(14, 169, 96, 0.8)` : `rgba(6, 147, 227, 0.8)`;
    const borderColor = mainWord ? colors.primary.a1 : "#0693e3";
    const borderWidth = mainWord ? 2.5 : 2;
    
    const revealProgress = useSharedValue(isRevealed ? 1 : 0);
    
    useEffect(() => {
        revealProgress.value = withTiming(isRevealed ? 1 : 0, { duration: 500 });
    }, [isRevealed]);

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(revealProgress.value, [0, 1], [backgroundColor1, backgroundColor2]),
    }));
    
    return (
        <Animated.View style={[styles.placeholderBase, {width: size, height: size, borderColor, borderWidth, backgroundColor: backgroundColor2}, animatedStyle]}>
          {
            (isRevealed || helped)&&
            <TextGradientSvg
                text={letter}
                fontFamily={Font.bakh_extra_black}
                fontSize={size/1.55}
                colors={mainWord?['#9900ef',  '#662d86', '#3a194d']:['#FF8800',  '#ff0f0f']}
                shadowColor={"#FFFFFF90"}
                shadowBlur={5}
                dropShadow={true}
                borderColor={"#FFFFFF"}
                borderWidth={0.4}
                glowBlur={100}
                glowColor={'#FFFFFF'}
                glowShadow={true}
            />
          }
        </Animated.View>
    );
};
const styles = StyleSheet.create({
    placeholderBase: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    placeholderText: {
        fontFamily: Font.bakh_black,
        color: '#FFFFFF',
    },
});

export default React.memo(PlaceholderSquare);