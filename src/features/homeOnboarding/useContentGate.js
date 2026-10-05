// src/features/onboarding/useContentGate.js
import {useCallback, useEffect, useRef} from 'react';
import {onboardingStorage} from './onboardingStorage';

const TAP_COOLDOWN_MS = 1000; // محافظ دابل‌تپ

/**
 * @param {boolean} hasContent        آیا محتوای بازی دانلود شده؟
 * @param {() => void} onShowWelcome  پیغام اول (فقط یک بار در عمر برنامه)
 * @param {() => void} onShowDownload پیغام دوم (تا وقتی محتوا دانلود نشده)
 */
export default function useContentGate({isReady, hasContent, onShowWelcome, onShowDownload}) {
    const welcomeSeenRef = useRef(null); // null = هنوز از حافظه خوانده نشده
    const lastTapRef = useRef(0);

    const onShowWelcomeRef = useRef(onShowWelcome);
    const onShowDownloadRef = useRef(onShowDownload);
    onShowWelcomeRef.current = onShowWelcome;
    onShowDownloadRef.current = onShowDownload;

    // خواندن فلگ پیغام خوش‌آمد
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const seen = await onboardingStorage.hasSeenWelcome();
            if (!cancelled) {
                // اگر قبلاً true شده (کاربر قدیمی)، هرگز به false برنگردد
                welcomeSeenRef.current = welcomeSeenRef.current === true ? true : seen;
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // کاربرانی که از قبل محتوا دارند (مثلاً بعد از آپدیت برنامه) نباید پیغام خوش‌آمد ببینند
    useEffect(() => {
        if (isReady && hasContent) {
            welcomeSeenRef.current = true;
            onboardingStorage.markWelcomeSeen();
        }
    }, [isReady, hasContent]);

    // لایه‌ی لمس‌گیر فقط وقتی محتوا نیست فعال است
    const isGateActive = isReady && !hasContent;

    const handleGatePress = useCallback(() => {
        if (welcomeSeenRef.current === null) {
            return; // فلگ هنوز خوانده نشده (چند میلی‌ثانیه‌ی اول)
        }
        const now = Date.now();
        if (now - lastTapRef.current < TAP_COOLDOWN_MS) {
            return;
        }
        lastTapRef.current = now;

        if (!welcomeSeenRef.current) {
            welcomeSeenRef.current = true;
            onboardingStorage.markWelcomeSeen(); // از این به بعد پیغام دوم نشان داده می‌شود
            onShowWelcomeRef.current?.();
        } else {
            onShowDownloadRef.current?.();
        }
    }, []);

    return {isGateActive, handleGatePress};
}