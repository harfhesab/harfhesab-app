import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
    Easing,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import {CARD_R, IS_RTL} from '../homeConfig';
import LightBand, {LIGHT_BAND_W} from './LightBand';

/* ═════════════ تنظیمات ═════════════ */
const STAGGER = 250; // فاصله‌ی شروع هر آیتم با آیتم قبلی (ms)
const MAX_DELAY = 2000; // آیتم‌های پایین صفحه بیشتر از این منتظر نمی‌مانند

// فنر نرم کارت‌ها: حدود ۱۳٪ از جایش رد می‌شود و برمی‌گردد و در حدود ۰٫۷ ثانیه می‌نشیند
const CARD_SPRING = {damping: 11, stiffness: 100, mass: 1};
// فنر هدر: پرش خیلی کم، تا لبه‌ی بالای صفحه لحظه‌ای خالی نماند
const HUD_SPRING = {damping: 16, stiffness: 120, mass: 1};

const VARIANTS = {
    // کارت‌ها و دکمه‌ها: از پایین (و با side از کنار)، کوچک‌تر، خوابیده به عقب و کمی چرخیده
    // پرتاب می‌شوند و با فنر صاف می‌نشینند. lead: صبر اولیه تا انفجار نور پس‌زمینه دیده شود
    rise: {lead: 200, x: 38, y: 110, scale: 0.7, tilt: 30, roll: 6, spring: CARD_SPRING},
    // هدر: از بالای صفحه پایین می‌آید
    drop: {lead: 80, x: 0, y: -80, scale: 1, tilt: 0, roll: 0, spring: HUD_SPRING},
};

/* درخشش عبوری روی کارت بعد از فرود (LightBand: فقط View معمولی؛ بدون Canvas اضافه) */
const GLINT_AFTER = 260; // ms بعد از شروع حرکت کارت، یعنی حدود لحظه‌ی فرود
const GLINT = {duration: 650, easing: Easing.inOut(Easing.quad)};
const DIR = IS_RTL ? -1 : 1; // درخشش در جهت خواندن حرکت می‌کند

// کارتی که برداشته شده با elevation روی هم‌ردیف‌هایش رسم می‌شود (بدون background، پس سایه ندارد).
// zIndex نه: در معماری جدید RN، تغییر zIndex ترتیب فرزندها را عوض می‌کند و ویوها جدا و دوباره وصل
// می‌شوند؛ همه‌ی Canvasهای اسکیای آن‌ها یک لحظه خاموش و روشن می‌شوند.
const RAISED_Z = 1;

/**
 * قاب ورود یک آیتم صفحه‌ی خانه.
 *
 * فرزندش از همان اول mount می‌شود (تا Canvasهای اسکیا پشت پرده آماده شوند) ولی تا وقتی
 * `go` (از useHomeIntro) ۱ نشده نامرئی است. بعد از آن، با تأخیر lead + order × STAGGER با فنر وارد می‌شود.
 *
 * همه‌چیز روی UI thread است: هیچ re-render ای در React رخ نمی‌دهد و چون فقط opacity و transform
 * ویوی والد عوض می‌شود، محتوای اسکیا دوباره رسم نمی‌شود (TextureView فقط جابه‌جا/محو می‌شود).
 *
 * آیتمی که بعد از شروع ورود اضافه شود (مثلاً دکمه‌ی تبلیغ که وضعیتش دیر رسید)
 * منتظر صف نمی‌ماند و همان لحظه با فنر وارد می‌شود.
 *
 * props:
 *   go            : SharedValue از useHomeIntro (۰ ← ۱)
 *   order         : جایگاه در صف ورود (۰ = اولین)
 *   variant       : 'rise' (پیش‌فرض) | 'drop'
 *   side          : ۱ / -۱ = از کدام طرف پرتاب شود (فیزیکی: ۱ = از راست)، ۰ = مستقیم از پایین
 *   glint         : بعد از فرود یک نوار نور از رویش عبور کند
 *   radius        : گردی گوشه‌ها برای بریدن درخشش (پیش‌فرض CARD_R)
 *   raisedCards   : (اختیاری) SharedValue<{[id]: boolean}> مشترک با GameCard
 *   raiseKey      : شناسه‌ی این آیتم در raisedCards؛ وقتی true شود، روی آیتم‌های کناری رسم می‌شود
 *   style         : استایل قاب (مثلاً absolute برای هدر)
 *   pointerEvents : مثل View
 */
export default function IntroReveal({
    go,
    order = 0,
    variant = 'rise',
    side = 0,
    glint = false,
    radius = CARD_R,
    raisedCards,
    raiseKey,
    style,
    pointerEvents,
    children,
}) {
    const v = VARIANTS[variant] || VARIANTS.rise;
    const delay = Math.min(v.lead + order * STAGGER, MAX_DELAY);
    const progress = useSharedValue(0);
    const shine = useSharedValue(0);

    // اندازه‌ی واقعی آیتم، فقط برای مسیر درخشش
    const [box, setBox] = useState(null);
    const onLayout = useCallback(e => {
        const {width, height} = e.nativeEvent.layout;
        setBox(prev => (prev && prev.w === width && prev.h === height ? prev : {w: width, h: height}));
    }, []);

    useAnimatedReaction(
        () => go.value,
        (current, previous) => {
            if (current !== 1 || previous === 1) {
                return;
            }
            // previous === null: آیتم بعد از شروع ورود mount شده ← بدون صف
            const wait = previous === null ? 0 : delay;
            progress.value = withDelay(wait, withSpring(1, v.spring));
            if (glint) {
                shine.value = withDelay(wait + GLINT_AFTER, withTiming(1, GLINT));
            }
        },
    );

    const animatedStyle = useAnimatedStyle(() => {
        const p = progress.value;
        const q = 1 - p; // هنگام رد شدن فنر از هدف منفی می‌شود ← پرش ظریف به سمت مقابل
        return {
            opacity: Math.min(1, p * 2), // خیلی زودتر از پایان حرکت کامل می‌شود
            transform: [
                {perspective: 1000},
                {translateX: q * v.x * side},
                {translateY: q * v.y},
                {rotateX: `${q * v.tilt}deg`},
                {rotateZ: `${q * v.roll * side}deg`},
                {scale: v.scale + (1 - v.scale) * p},
            ],
        };
    });

    // استایل جدا: useAnimatedStyle با هر تغییر کل استایلش را می‌فرستد؛ اگر elevation کنار انیمیشن
    // ورود بود، هر فریم دوباره فرستاده می‌شد. اینجا فقط وقتی raisedCards عوض شود اجرا می‌شود.
    const raiseStyle = useAnimatedStyle(() =>
        raisedCards ? {elevation: raisedCards.value[raiseKey] ? RAISED_Z : 0} : {},
    );

    const boxW = box ? box.w : 0;
    const boxH = box ? box.h : 0;
    const glintReach = LIGHT_BAND_W + boxH * 0.4; // نوار چرخیده باید کامل بیرون از کارت شروع و تمام شود
    const glintStyle = useAnimatedStyle(() => {
        const s = shine.value;
        return {
            opacity: s > 0 && s < 1 ? 1 : 0,
            transform: [
                {translateX: DIR * (-glintReach + s * (boxW + glintReach * 2))},
                {rotate: `${DIR * 20}deg`},
            ],
        };
    });

    return (
        <Animated.View
            onLayout={glint ? onLayout : undefined}
            pointerEvents={pointerEvents}
            style={[style, animatedStyle, raiseStyle]}>
            {children}
            {glint && box ? (
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, {borderRadius: radius, overflow: 'hidden'}]}>
                    <LightBand height={boxH * 1.8} style={[{top: -boxH * 0.4}, glintStyle]} />
                </View>
            ) : null}
        </Animated.View>
    );
}
