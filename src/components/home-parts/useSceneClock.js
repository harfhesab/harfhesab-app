import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';
import {useFrameCallback, useSharedValue} from 'react-native-reanimated';

/**
 * ساعت مشترک انیمیشن‌ها (میلی‌ثانیه، SharedValue).
 *
 * فقط وقتی می‌تپد که:
 *  - صفحه فوکوس دارد (در React Navigation صفحه‌ی زیرین بعد از رفتن به صفحه‌ی بعد
 *    هنوز mount است و بی‌دلیل باتری می‌خورد)
 *  - کاربر در تنظیمات اندروید «کاهش حرکت» را روشن نکرده باشد
 *
 * هنگام توقف، زمان جهش نمی‌کند و بعداً از همان‌جا ادامه می‌یابد.
 */
export default function useSceneClock(navigation) {
    const [focused, setFocused] = useState(true);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        const offFocus = navigation.addListener('focus', () => setFocused(true));
        const offBlur = navigation.addListener('blur', () => setFocused(false));
        return () => {
            offFocus();
            offBlur();
        };
    }, [navigation]);

    useEffect(() => {
        let alive = true;
        AccessibilityInfo.isReduceMotionEnabled().then(v => alive && setReduceMotion(v));
        const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
        return () => {
            alive = false;
            sub.remove();
        };
    }, []);

    const time = useSharedValue(0);
    const frame = useFrameCallback(info => {
        time.value += info.timeSincePreviousFrame ?? 0;
    }, false);

    const active = focused && !reduceMotion;
    useEffect(() => {
        frame.setActive(active);
    }, [active, frame]);

    return time;
}
