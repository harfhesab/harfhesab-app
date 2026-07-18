import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import SimpleBorderText from '../../../text-components/SimpleBorderText';

interface PlaceholderSquareProps {
  letter: string;
  isRevealed: boolean;
  size: number;
  mainWord: boolean;
}

const PlaceholderSquare = ({ letter, isRevealed, size, mainWord }: PlaceholderSquareProps) => {
    const colors = useAppTheme();
    
    const themeStyles = useMemo(() => {
        return {
            backgroundColor1: mainWord ? `rgba(14, 169, 96, 0.2)` : `rgba(6, 147, 227, 0.2)`,
            backgroundColor2: mainWord ? `rgba(14, 169, 96, 0.8)` : `rgba(6, 147, 227, 0.8)`,
            borderColor: mainWord ? colors.primary.a1 : colors.primary.a6,
            borderWidth: mainWord ? 2 : 1,
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
    
    const showContent = isRevealed;

    return (
        <Animated.View 
            style={[
                styles.placeholderBase, 
                {
                    width: size, 
                    height: size, 
                    borderRadius: mainWord ? 7 : 3.5,
                    borderColor: themeStyles.borderColor, 
                    borderWidth: themeStyles.borderWidth,
                }, 
                animatedStyle
            ]}
        >
          {showContent && (
            <SimpleBorderText
                text={letter}
                width={size}
                height={size}
                fontSize={size/1.4}
                borderWidth={1}
                textColor={"#960000"}
                borderColor={"#ffeb3b"}
                fontName={"YekanBakh-ExtraBlack"}
            />
          )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    placeholderBase: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default React.memo(PlaceholderSquare, (prev, next) => {
    return (
        prev.isRevealed === next.isRevealed &&
        prev.letter === next.letter &&
        prev.size === next.size &&
        prev.mainWord === next.mainWord
    );
});