import { useCallback } from 'react';
import {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

type Options = {
    pressedScale?: number;
    pressedTranslateY?: number;
};

/**
 * انیمیشن مشترک لمس برای دکمه‌ها (Reanimated 3.17.5)
 * - هنگام لمس: فشرده شدن سریع (scale پایین + کمی حرکت به پایین)
 * - هنگام رها کردن: برگشت فنری با کمی پرش (overshoot)
 * - sweep: برای افکت درخشش (shine) که از چپ به راست رد می‌شود
 */
export default function usePressAnimation({
    pressedScale = 0.94,
    pressedTranslateY = 1.5,
}: Options = {}) {
    const pressed = useSharedValue(0);
    const sweep = useSharedValue(0);

    const onPressIn = useCallback(() => {
        pressed.value = withTiming(1, {
            duration: 110,
            easing: Easing.out(Easing.cubic),
        });
        sweep.value = 0;
        sweep.value = withTiming(1, {
            duration: 520,
            easing: Easing.out(Easing.quad),
        });
    }, [pressed, sweep]);

    const onPressOut = useCallback(() => {
        // damping پایین => کمی پرش بعد از رها کردن
        pressed.value = withSpring(0, {
            damping: 7,
            stiffness: 320,
            mass: 0.7,
        });
    }, [pressed]);

    const pressStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(pressed.value, [0, 1], [0, pressedTranslateY]) },
            { scale: interpolate(pressed.value, [0, 1], [1, pressedScale]) },
        ],
    }));

    return { pressed, sweep, onPressIn, onPressOut, pressStyle };
}