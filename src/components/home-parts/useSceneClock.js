import {useCallback, useEffect, useRef} from 'react';
import {AccessibilityInfo} from 'react-native';
import {useFrameCallback, useSharedValue} from 'react-native-reanimated';

/**
 * ساعت مشترک انیمیشن‌ها (میلی‌ثانیه، SharedValue).
 *
 * فقط وقتی می‌تپد که:
 *  - صفحه فوکوس دارد (در native-stack صفحه‌ی زیرین بعد از رفتن به صفحه‌ی بعد هنوز mount است)
 *  - کاربر در تنظیمات اندروید «کاهش حرکت» را روشن نکرده باشد
 *
 * هنگام توقف، زمان جهش نمی‌کند و بعداً از همان‌جا ادامه می‌یابد.
 *
 * تفاوت با نسخه‌ی قبلی: وضعیت‌ها در ref نگه داشته می‌شوند و ساعت مستقیماً داخل listenerهای
 * focus / blur قطع و وصل می‌شود، نه از مسیر setState ← رندر ← useEffect. دو دلیل:
 *  ۱. هنگام push شدن صفحه‌ی بعد، ترد JS مشغول mount آن است و مسیر قبلی چند صد میلی‌ثانیه دیر
 *     می‌رسید؛ در همان بازه‌ی حساس Skia و Reanimated بی‌دلیل برای Home کار می‌کردند.
 *  ۲. اگر freezeOnBlur / enableFreeze روشن باشد، صفحه‌ی بلور‌شده فریز می‌شود و setState
 *     داخلش تا برگشتن رندر نمی‌شود؛ یعنی useEffect قبلی هرگز اجرا نمی‌شد و ساعت پشت‌صحنه
 *     می‌تپید. listener ساده‌ی JS از فریز تأثیر نمی‌گیرد.
 */
export default function useSceneClock(navigation) {
    const time = useSharedValue(0);
    const frame = useFrameCallback(info => {
        time.value += info.timeSincePreviousFrame ?? 0;
    }, false);

    const focusedRef = useRef(navigation?.isFocused ? navigation.isFocused() : true);
    const reduceMotionRef = useRef(false);

    const apply = useCallback(() => {
        frame.setActive(focusedRef.current && !reduceMotionRef.current);
    }, [frame]);

    useEffect(() => {
        focusedRef.current = navigation?.isFocused ? navigation.isFocused() : true;
        apply();

        const offFocus = navigation.addListener('focus', () => {
            focusedRef.current = true;
            apply();
        });
        const offBlur = navigation.addListener('blur', () => {
            focusedRef.current = false;
            apply();
        });
        return () => {
            offFocus();
            offBlur();
        };
    }, [navigation, apply]);

    useEffect(() => {
        let alive = true;
        AccessibilityInfo.isReduceMotionEnabled().then(v => {
            if (alive) {
                reduceMotionRef.current = v;
                apply();
            }
        });
        const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', v => {
            reduceMotionRef.current = v;
            apply();
        });
        return () => {
            alive = false;
            sub.remove();
        };
    }, [apply]);

    return time;
}