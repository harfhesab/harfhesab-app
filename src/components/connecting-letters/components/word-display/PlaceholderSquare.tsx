import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
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
    
    const themeStyles = useMemo(() => {
        return {
            backgroundColor1: mainWord ? `rgba(14, 169, 96, 0.2)` : `rgba(6, 147, 227, 0.2)`,
            backgroundColor2: mainWord ? `rgba(14, 169, 96, 0.8)` : `rgba(6, 147, 227, 0.8)`,
            borderColor: mainWord ? colors.primary.a1 : "#0693e3",
            borderWidth: mainWord ? 2.5 : 2,
            gradientColors: mainWord ? ['#9900ef', '#662d86', '#3a194d'] : ['#FF8800', '#ff0f0f']
        }
    }, [mainWord, colors.primary.a1]);

    const revealProgress = useSharedValue(isRevealed ? 1 : 0);
    
    useEffect(() => {
        revealProgress.value = withTiming(isRevealed ? 1 : 0, { duration: 500 });
    }, [isRevealed]);

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            revealProgress.value, 
            [0, 1], 
            [themeStyles.backgroundColor1, themeStyles.backgroundColor2]
        ),
    }));
    
    const showContent = isRevealed || helped;

    return (
        <Animated.View 
            style={[
                styles.placeholderBase, 
                {
                    width: size, 
                    height: size, 
                    borderColor: themeStyles.borderColor, 
                    borderWidth: themeStyles.borderWidth,
                }, 
                animatedStyle
            ]}
        >
          {showContent && (
            <TextGradientSvg
                text={letter}
                fontFamily={Font.bakh_extra_black}
                fontSize={size/1.55}
                colors={themeStyles.gradientColors}
                shadowColor={"#FFFFFF90"}
                shadowBlur={3}
                dropShadow={true}
                borderColor={"#FFFFFF"}
                borderWidth={0.4}
                glowBlur={10}
                glowColor={'#FFFFFF'}
                glowShadow={true} 
            />
          )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    placeholderBase: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
});

export default React.memo(PlaceholderSquare, (prev, next) => {
    return (
        prev.isRevealed === next.isRevealed &&
        prev.helped === next.helped &&
        prev.letter === next.letter &&
        prev.size === next.size &&
        prev.mainWord === next.mainWord
    );
});