import {useEffect, useRef} from 'react';
import {Easing, cancelAnimation, runOnUI, useSharedValue, withTiming} from 'react-native-reanimated';

/* ═════════════ تنظیمات ═════════════ */
export const INTRO_MS = 2400; // طول تایم‌لاین افکت‌های نوری ورود (clock از ۰ تا این عدد می‌رود)

const MIN_WAIT = 120; // حداقل انتظار (ms): تا mount ویوهای native حتماً شروع شده باشد
const MAX_WAIT = 900; // سقف انتظار (ms): روی گوشی‌های خیلی ضعیف هم بیشتر از این صبر نمی‌شود
const SMOOTH_FRAME = 34; // فریمی که کمتر از این طول بکشد «آرام» است (حدود ۳۰fps به بالا)
const SMOOTH_STREAK = 4; // این تعداد فریم آرام پشت‌سرهم یعنی کار سنگین شروع صفحه تمام شده

const now = () => (global.performance && global.performance.now ? global.performance.now() : Date.now());

/**
 * کارگردان ورود صفحه‌ی خانه.
 *
 * مشکل: هر Canvas اسکیا در اندروید یک TextureView جداست (این صفحه حدود ۳۰ تا دارد) و
 * سطح GL هر کدام چند فریم بعد از mount آماده می‌شود؛ برای همین متن‌های RN زودتر از کارت‌ها دیده می‌شدند.
 *
 * راه‌حل: همه‌چیز از همان ابتدا mount می‌شود ولی نامرئی می‌ماند (IntroReveal) تا اسکیا پشت پرده
 * کارش را بکند. این هوک با requestAnimationFrame طول فریم‌ها را می‌سنجد (هم UI thread و هم JS را
 * پوشش می‌دهد) و به محض این‌که چند فریم پشت‌سرهم روان شد، ورود را شروع می‌کند؛ یعنی روی گوشی سریع
 * تقریباً بلافاصله و روی گوشی کند دقیقاً وقتی آماده شد. انیمیشن‌ها در لحظه‌ای آرام اجرا می‌شوند و نمی‌لنگند.
 *
 *  - فقط وقتی صفحه فوکوس دارد شروع می‌کند (اگر خانه زیر صفحه‌ی دیگری mount شود، ورود
 *    وقتی پخش می‌شود که کاربر واقعاً به خانه برگردد)
 *  - فقط یک‌بار در عمر صفحه پخش می‌شود
 *  - با blur تایم‌لاین نور مکث می‌کند و با focus ادامه می‌یابد (مثل useSceneClock)
 *
 * @param navigation  navigation همین صفحه
 * @param dataReady   تا true نشود ورود شروع نمی‌شود (مثلاً تا معلوم شود دکمه‌ی تبلیغ هست یا نه،
 *                    که وسط ورود جای کارت‌ها جابه‌جا نشود). سقف MAX_WAIT همچنان برقرار است.
 * @returns {{go, clock}}
 *   go    : SharedValue — ۰ تا قبل از شروع، ۱ از لحظه‌ی شروع (برای IntroReveal)
 *   clock : SharedValue — میلی‌ثانیه از لحظه‌ی شروع، خطی تا INTRO_MS (برای افکت‌های نوری پس‌زمینه)
 */
export default function useHomeIntro(navigation, dataReady = true) {
    const go = useSharedValue(0);
    const clock = useSharedValue(0);
    const dataReadyRef = useRef(dataReady);
    dataReadyRef.current = dataReady;

    useEffect(() => {
        let raf = null;
        let started = false; // go زده شده

        const watch = () => {
            if (started || raf !== null) {
                return;
            }

            const t0 = now();
            let last = t0;
            let streak = 0;

            const tick = () => {
                const t = now();
                streak = t - last < SMOOTH_FRAME ? streak + 1 : 0;
                last = t;

                const elapsed = t - t0;
                const calm = elapsed >= MIN_WAIT && streak >= SMOOTH_STREAK;
                if (elapsed >= MAX_WAIT || (calm && dataReadyRef.current)) {
                    raf = null;
                    started = true;
                    go.value = 1;
                    clock.value = withTiming(INTRO_MS, {duration: INTRO_MS, easing: Easing.linear});
                    return;
                }
                raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
        };

        // اگر کاربر وسط ورود به صفحه‌ی دیگری برود (مثلاً سریع روی کارت بزند)، تایم‌لاین نور مثل
        // useSceneClock متوقف می‌شود؛ وگرنه کانواس تمام‌صفحه‌ی پس‌زمینه تا ۲٫۴ ثانیه هر فریم دوباره
        // رسم می‌شد، درست هم‌زمان با mount صفحه‌ی بعد. با برگشت، از همان نقطه ادامه می‌یابد.
        const pause = () => {
            if (!started) {
                // هنوز در حال سنجش فریم‌ها: سنجش قطع و با فوکوس بعدی از نو شروع می‌شود
                raf !== null && cancelAnimationFrame(raf);
                raf = null;
                return;
            }
            cancelAnimation(clock);
        };

        const resume = () => {
            if (!started) {
                watch();
                return;
            }
            runOnUI(() => {
                'worklet';
                const left = INTRO_MS - clock.value;
                if (left > 0) {
                    clock.value = withTiming(INTRO_MS, {duration: left, easing: Easing.linear});
                }
            })();
        };

        if (!navigation?.isFocused || navigation.isFocused()) {
            watch();
        }
        const offFocus = navigation?.addListener?.('focus', resume);
        const offBlur = navigation?.addListener?.('blur', pause);

        return () => {
            offFocus && offFocus();
            offBlur && offBlur();
            raf !== null && cancelAnimationFrame(raf);
        };
    }, [navigation, go, clock]);

    return {go, clock};
}
