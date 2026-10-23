import React, {memo, useCallback, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Canvas, Group} from '@shopify/react-native-skia';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import {CARD_R, INSET, SLOT_R} from '../homeConfig';
import {getGeometry, mirrorX} from '../homeGeometry';
import {HAPTIC_LAND, HAPTIC_LIFT, HAPTIC_LOCKED, vibrate} from '../homeHaptics';
import CardBadge from './CardBadge';
import CardSurface, {SURFACE_BLEED} from './CardSurface';
import CardTags from './CardTags';
import GlassVeil from './GlassVeil';
import FeaturedAura from './FeaturedAura';
import LocalImageComponent from '../../image-components/LocalImageComponent';
import DynamicProSkiaText from '../../text-components/DynamicProSkiaText';
import { colors } from '../../../hooks/theme/colors';
import Font from '../../../utils/Font';

/* ═════════════ حس لمسی ═════════════ */
const GRAB_DELAY = 200; // ms نگه‌داشتن انگشت تا کارت برداشته شود (کمتر = برداشتن سریع‌تر؛ زیر ~۱۶۰ لمس‌های آرام هم برداشتن حساب می‌شوند)
const GRAB_SLOP = 10; // dp: کشیدن افقی بیش از این = برداشتن فوری (کشیدن عمودی = اسکرول صفحه)
const PRESS_DELAY = 60; // ms: فرو رفتن کمی دیرتر شروع می‌شود تا با شروع هر اسکرول کارت‌ها چشمک نزنند
const TAP_SLOP = 12; // dp: حرکت بیشتر از این یعنی لمس نیست

// dp = ۱/۱۶۰ اینچ ← ۱ سانتی‌متر ≈ ۰٫۳۹۴ اینچ ≈ ۶۳ dp
// اگر کارت در تمام مدت کشیدن بیشتر از این فاصله از جای اصلی‌اش دور نشده باشد، موقع رها کردن «کلیک» حساب می‌شود
const CLICK_MAX_DISTANCE = 60;

const PRESS_DEPTH = 0.04; // لمس: ۴٪ کوچک شدن
const LIFT_SCALE = 0.07; // برداشته‌شده: ۷٪ بزرگ‌تر
const MAX_SWAY = 7; // درجه: چرخش کارت در جهت حرکت، مثل کارتی که در دست جابه‌جا می‌شود
const MAX_TILT = 8; // درجه: کج شدن سه‌بعدی در جهت حرکت
const SWAY_SPEED = 1600; // dp/s: سرعتی که چرخش در آن به حداکثر می‌رسد

const PRESS_RELEASE = {damping: 9, stiffness: 320, mass: 0.8}; // برگشت پرشی بعد از لمس
const LIFT_SPRING = {damping: 12, stiffness: 320}; // پرش برداشتن و گذاشتن
const SWAY_SPRING = {damping: 20, stiffness: 300}; // نرم کردن چرخش و کج شدن
// پرواز فنری به جای خود: ~۱۰٪ رد شدن از هدف، نشستن در ~۰٫۴۵ ثانیه (stiffness بیشتر = برگشت سریع‌تر)
const RETURN_SPRING = {damping: 16, stiffness: 200, mass: 0.9};
const BADGE_POP = {damping: 7, stiffness: 220};

const A11Y_ACTIONS = [{name: 'activate'}];

// کانواس بدنه از هر طرف SURFACE_BLEED بیرون زده؛ محتوا به اندازه‌ی همان حاشیه جابه‌جا می‌شود
const SURFACE_OFFSET = [{translateX: SURFACE_BLEED}, {translateY: SURFACE_BLEED}];

// مقایسه‌ی جای چیپ‌ها تا با onLayout تکراری، کارت بی‌دلیل دوباره رسم نشود
const sameBoxes = (a, b) =>
    a === b ||
    (a !== null &&
        b !== null &&
        a.length === b.length &&
        a.every((p, i) => p.x === b[i].x && p.y === b[i].y && p.w === b[i].w && p.h === b[i].h));

const clamp1 = x => {
    'worklet';
    return x < -1 ? -1 : x > 1 ? 1 : x;
};

/**
 * کارت بازی.
 *
 * قانون RTL: Skia مختصات فیزیکی (از چپ) می‌خواهد، پس با mirrorX وارونه می‌شود؛
 * ویوهای RN با `start` / `end` جای‌گذاری می‌شوند (نه left/right که در RTL جابه‌جا می‌شوند).
 * به این ترتیب قاب Skia، تصویر و متن همیشه روی هم می‌افتند.
 *
 * ترتیب لایه‌ها: کانواس ثابت (CardSurface) ← هاله‌ی برداشتن ← تصویر ← متن (عنوان، زیرعنوان، تگ‌ها)
 *                ← هاله‌ی ویژه (فقط featured) ← هاله‌ی شیشه‌ای (فقط غیرفعال) ← باکس badge
 *
 * `time` فقط برای کارت‌های featured استفاده می‌شود (انیمیشن هاله).
 *
 * حس لمسی (react-native-gesture-handler + Reanimated، همه روی UI thread، بدون هیچ re-render):
 *  - لمس کوتاه : کارت فرو می‌رود و با پرش برمی‌گردد، بعد بازی باز می‌شود
 *  - برداشتن   : با نگه‌داشتن انگشت (GRAB_DELAY) یا کشیدن افقی؛ کارت بزرگ‌تر می‌شود، هاله‌ی طلایی
 *                می‌گیرد و گوشی می‌لرزد
 *  - کشیدن     : کارت دقیقاً همراه انگشت روی کل صفحه حرکت می‌کند و در جهت حرکت می‌چرخد و کج می‌شود
 *  - رها کردن  : با سرعت همان لحظه‌ی رها شدن، فنری به جای خودش برمی‌گردد و با رسیدن یک لرزش کوچک
 *                اگر در کل مدت کشیدن بیشتر از CLICK_MAX_DISTANCE (≈ ۱ سانتی‌متر) از جای خود دور نشده باشد،
 *                موقع رها کردن مثل یک کلیک بازی باز می‌شود (کارت قفل: لرزش «نه»)
 *  - کارت قفل  : با لمس مثل قفل می‌لرزد و badge «به‌زودی» می‌پرد
 *  - کشیدن عمودی سریع همان اسکرول صفحه است
 *
 * props:
 *   interactive : false = هیچ لمسی پذیرفته نمی‌شود (مثلاً وقتی FirstTouchGate فعال است)
 *   onPress     : (route) => void
 *   raisedCards : SharedValue<{[id]: boolean}> مشترک با IntroReveal؛ کارت برداشته‌شده با elevation
 *                 روی بقیه رسم می‌شود. (zIndex نه: در معماری جدید RN تغییر zIndex ویوها را جدا و
 *                 دوباره وصل می‌کند و همه‌ی Canvasهای اسکیا یک لحظه خاموش و روشن می‌شوند.)
 */
const GameCard = memo(function GameCard({item, width, height, mode, time, interactive = true, onPress, raisedCards}) {
    const active = item.active !== false;
    const featured = Boolean(item.featured) && active;
    const {slot, text} = useMemo(() => getGeometry(width, height, mode), [width, height, mode]);

    // مختصات فیزیکی برای Skia
    const slotX = mirrorX(slot.x, slot.size, width);
    const textLeft = mirrorX(text.x, text.width, width);
    const medallionX = textLeft + text.width / 2;

    // پس‌زمینه‌ی چیپ‌های تگ داخل همین کانواس بدنه رسم می‌شود (نه یک Canvas برای هر چیپ)؛
    // CardTags جای چیپ‌ها را نسبت به جعبه‌ی متن می‌دهد و اینجا به مختصات کارت می‌رود
    const [chipsInText, setChipsInText] = useState(null);
    const onChipsLayout = useCallback(next => setChipsInText(prev => (sameBoxes(prev, next) ? prev : next)), []);
    const chips = useMemo(
        () => (chipsInText ? chipsInText.map(c => ({...c, x: textLeft + c.x, y: text.y + c.y})) : null),
        [chipsInText, textLeft, text.y],
    );

    // badge: گوشه‌ی بالا-end (روی تصویر در حالت ستونی)
    const badgeOffset = mode === 'row' ? INSET : INSET + 8;
    const hasBadge = Boolean(item.badge);

    // اندازه‌ی عنوان؛ کارت ویژه دو واحد درشت‌تر
    const baseTitleSize = mode === 'row' ? (item.title?.length > 14 ? 20 : 25) : (item.title?.length > 14 ? 18 : 23);
    const titleSize = baseTitleSize + (featured ? 2 : 0);

    /* ═════════════ حالت‌های لمسی ═════════════ */
    const press = useSharedValue(0); // ۰ تا ۱: فرو رفتن
    const lift = useSharedValue(0); // ۰ تا ۱: برداشته شدن
    const dragX = useSharedValue(0); // جابه‌جایی از جای اصلی (dp)
    const dragY = useSharedValue(0);
    const baseX = useSharedValue(0); // جای کارت در لحظه‌ی گرفتن (اگر وسط برگشت دوباره گرفته شود)
    const baseY = useSharedValue(0);
    const sway = useSharedValue(0); // چرخش در جهت حرکت (درجه)
    const tiltX = useSharedValue(0);
    const tiltY = useSharedValue(0);
    const homing = useSharedValue(0); // ۱ = در حال برگشت به جای خود
    const shake = useSharedValue(0); // لرزش قفل (درجه)
    const pop = useSharedValue(0); // پرش badge
    const maxDist = useSharedValue(0); // بیشترین فاصله‌ای که کارت در طول این کشیدن از جای اصلی‌اش گرفته (dp)


    const openGame = useCallback(() => {
        onPress(item.route)
    }, [onPress, item.route]);

    const gesture = useMemo(() => {
        const id = item.id;

        const setRaised = raised => {
            'worklet';
            if (raisedCards && Boolean(raisedCards.value[id]) !== raised) {
                raisedCards.value = {...raisedCards.value, [id]: raised};
            }
        };

        // وقتی کارت کاملاً سر جایش نشست، دوباره هم‌سطح بقیه می‌شود
        const settled = finished => {
            'worklet';
            if (finished && Math.abs(dragX.value) < 0.5 && Math.abs(dragY.value) < 0.5) {
                setRaised(false);
            }
        };

        // لرزش «نه» + پرش badge برای کارت قفل (هم از tap و هم از رها کردن بعد از جابه‌جایی کم)
        const playLockedFeedback = () => {
            'worklet';
            shake.value = withSequence(
                withTiming(-5, {duration: 45}),
                withTiming(5, {duration: 80}),
                withTiming(-4, {duration: 75}),
                withTiming(3, {duration: 70}),
                withSpring(0, {damping: 8, stiffness: 260}),
            );
            pop.value = withSequence(withTiming(1, {duration: 110}), withSpring(0, BADGE_POP));
            runOnJS(vibrate)(HAPTIC_LOCKED);
        };

        const grabStart = () => {
            'worklet';
            homing.value = 0;
            // اگر وسط پرواز برگشت دوباره گرفته شد، فنر همین‌جا می‌ایستد و کارت از همان نقطه دنبال انگشت می‌آید
            cancelAnimation(dragX);
            cancelAnimation(dragY);
            baseX.value = dragX.value;
            baseY.value = dragY.value;
            // شروع اندازه‌گیری مسافت (اگر وسط پرواز گرفته شده، فاصله‌ی فعلی از جای اصلی حساب می‌شود)
            maxDist.value = Math.sqrt(dragX.value * dragX.value + dragY.value * dragY.value);
            press.value = withSpring(0, PRESS_RELEASE);
            lift.value = withSpring(1, LIFT_SPRING);
            setRaised(true);
            runOnJS(vibrate)(HAPTIC_LIFT);
        };

        const grabMove = e => {
            'worklet';
            // دقیقاً همراه انگشت، بدون هیچ مقاومتی
            dragX.value = baseX.value + e.translationX;
            dragY.value = baseY.value + e.translationY;
            // ثبت بیشترین فاصله از جای اصلی
            const d = Math.sqrt(dragX.value * dragX.value + dragY.value * dragY.value);
            if (d > maxDist.value) {
                maxDist.value = d;
            }
            // چرخش و کج شدن از سرعت حرکت؛ با ایستادن انگشت نرم صاف می‌شود
            const vx = clamp1(e.velocityX / SWAY_SPEED);
            const vy = clamp1(e.velocityY / SWAY_SPEED);
            sway.value = withSpring(vx * MAX_SWAY, SWAY_SPRING);
            tiltY.value = withSpring(vx * MAX_TILT, SWAY_SPRING);
            tiltX.value = withSpring(-vy * MAX_TILT, SWAY_SPRING);
        };

        const grabEnd = e => {
            'worklet';
            // اگر کارت در کل مدت کشیدن از ~۱ سانتی‌متر دورتر نرفته باشد، مثل کلیک حساب می‌شود
            const isClick = maxDist.value < CLICK_MAX_DISTANCE;

            // اگر کلیکِ کارت فعال است، ویبره‌ی «نشستن» لازم نیست (صفحه‌ی دیگری باز می‌شود)
            homing.value = isClick && active ? 0 : 1;
            // سرعت لحظه‌ی رها شدن به فنر داده می‌شود تا حرکت پیوسته و طبیعی بماند
            dragX.value = withSpring(0, {...RETURN_SPRING, velocity: e.velocityX}, settled);
            dragY.value = withSpring(0, {...RETURN_SPRING, velocity: e.velocityY}, settled);
            sway.value = withSpring(0, SWAY_SPRING);
            tiltX.value = withSpring(0, SWAY_SPRING);
            tiltY.value = withSpring(0, SWAY_SPRING);
            lift.value = withSpring(0, LIFT_SPRING);

            if (isClick) {
                if (active) {
                    runOnJS(openGame)();
                } else {
                    playLockedFeedback();
                }
            }
        };

        // برداشتن با نگه‌داشتن انگشت (به هر جهتی بعد از آن)
        const holdGrab = Gesture.Pan()
            .enabled(interactive)
            .activateAfterLongPress(GRAB_DELAY)
            .onStart(grabStart)
            .onUpdate(grabMove)
            .onEnd(grabEnd);

        // برداشتن فوری با کشیدن افقی؛ کشیدن عمودی شکست می‌خورد و صفحه اسکرول می‌شود
        const swipeGrab = Gesture.Pan()
            .enabled(interactive)
            .activeOffsetX([-GRAB_SLOP, GRAB_SLOP])
            .failOffsetY([-GRAB_SLOP, GRAB_SLOP])
            .onStart(grabStart)
            .onUpdate(grabMove)
            .onEnd(grabEnd);

        const tap = Gesture.Tap()
            .enabled(interactive)
            .maxDistance(TAP_SLOP)
            .onBegin(() => {
                press.value = withDelay(PRESS_DELAY, withTiming(1, {duration: 90}));
            })
            .onEnd((_e, success) => {
                if (!success) {
                    return;
                }
                press.value = withSequence(withTiming(1, {duration: 60}), withSpring(0, PRESS_RELEASE));
                if (active) {
                    runOnJS(openGame)();
                    return;
                }
                // کارت قفل: لرزش «نه» + پرش badge
                playLockedFeedback();
            })
            .onFinalize((_e, success) => {
                if (!success) {
                    press.value = withSpring(0, PRESS_RELEASE);
                }
            });

        // اولی که فعال شود برنده است
        return Gesture.Race(swipeGrab, holdGrab, tap);
    }, [
        item.id,
        interactive,
        active,
        openGame,
        raisedCards,
        press,
        lift,
        dragX,
        dragY,
        baseX,
        baseY,
        sway,
        tiltX,
        tiltY,
        homing,
        shake,
        pop,
        maxDist,
    ]);

    // لرزش کوچک لحظه‌ی رسیدن کارت به جای خودش
    useAnimatedReaction(
        () => homing.value === 1 && Math.abs(dragX.value) < 3 && Math.abs(dragY.value) < 3,
        (landed, previous) => {
            if (landed && !previous) {
                homing.value = 0;
                runOnJS(vibrate)(HAPTIC_LAND);
            }
        },
    );

    const cardStyle = useAnimatedStyle(() => ({
        transform: [
            {perspective: 900},
            {translateX: dragX.value},
            {translateY: dragY.value},
            {rotateX: `${tiltX.value}deg`},
            {rotateY: `${tiltY.value}deg`},
            {rotateZ: `${sway.value + shake.value}deg`},
            {scale: 1 + lift.value * LIFT_SCALE - press.value * PRESS_DEPTH},
        ],
    }));

    const haloStyle = useAnimatedStyle(() => ({opacity: lift.value}));

    const badgeStyle = useAnimatedStyle(() => ({transform: [{scale: 1 + pop.value * 0.25}]}));

    // TalkBack: دابل‌تپ همان لمس کوتاه است
    const onAccessibilityAction = useCallback(
        e => {
            if (e.nativeEvent.actionName === 'activate' && interactive && active) {
                onPress(item.route);
            }
        },
        [interactive, active, onPress, item.route],
    );

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                accessible
                accessibilityRole="button"
                accessibilityState={{disabled: !active || !interactive}}
                accessibilityLabel={
                    `${item.title}${item.subtitle ? `، ${item.subtitle}` : ''}${hasBadge ? `، ${item.badge}` : ''}`
                }
                accessibilityActions={A11Y_ACTIONS}
                onAccessibilityAction={onAccessibilityAction}
                style={[{width, height}, cardStyle]}>
                {/* بدنه‌ی ثابت کارت (CardSurface)؛ کانواس از هر طرف SURFACE_BLEED بزرگ‌تر است تا سایه‌ی زیر کارت جا شود */}
                <Canvas style={styles.surface} pointerEvents="none">
                    <Group transform={SURFACE_OFFSET}>
                        <CardSurface
                            width={width}
                            height={height}
                            mode={mode}
                            colors={item.colors}
                            slotX={slotX}
                            slotY={slot.y}
                            slotSize={slot.size}
                            textY={text.y}
                            medallionX={medallionX}
                            hasBadge={hasBadge}
                            chips={chips}
                        />
                    </Group>
                </Canvas>

                {/* هاله‌ی طلایی «برداشته‌شده» (کاملاً بیرون از لبه‌ی کارت، روی سایه؛ در حالت عادی نامرئی) */}
                <Animated.View pointerEvents="none" style={[styles.haloSoft, haloStyle]} />
                <Animated.View pointerEvents="none" style={[styles.halo, haloStyle]} />

                {/* تصویر مربعی ۱:۱ (RN، با start به‌جای left) */}
                <View
                    style={[
                        styles.slot,
                        {
                            start: slot.x,
                            top: slot.y,
                            width: slot.size,
                            height: slot.size,
                            backgroundColor: item.image ? 'transparent' : item.placeholder,
                        },
                    ]}>
                    <LocalImageComponent
                        path={item.image}
                        width={slot.size}
                        height={slot.size}
                        resizeMode={'stretch'}
                        blank_background={true}
                    />
                </View>

                {/* متن */}
                <View
                    pointerEvents="none"
                    style={[
                        styles.textBox,
                        {
                            gap:3,
                            start: text.x,
                            top: text.y,
                            width: text.width,
                            height: text.height,
                            // در حالت row، متن زیر باکس badge شروع شود تا روی هم نیفتند
                            paddingTop: mode === 'row' && hasBadge ? 24 : 0,
                        },
                    ]}>
                    <DynamicProSkiaText
                        text={item.title}
                        maxWidth={text.width}
                        textColor={colors.primary.a2}
                        borderColor={"#FFFFFF"}
                        fontName='YekanBakh-ExtraBlack'
                        borderWidth={1}
                        fontSize={titleSize}
                    />
                    {item.subtitle ? (
                        <Text style={[styles.subtitle, {fontFamily:Font.bakh_semi_bold}]} numberOfLines={3}>
                            {item.subtitle}
                        </Text>
                    ) : null}
                    {item.tags?.length ? (
                        <CardTags
                            tags={item.tags}
                            compact={mode === 'column'}
                            style={styles.tags}
                            onChipsLayout={onChipsLayout}
                        />
                    ) : null}
                </View>

                {/* هاله‌ی جلب‌توجه (فقط featured) */}
                {featured ? (
                    <FeaturedAura
                        width={width}
                        height={height}
                        colors={item.colors}
                        slotX={slotX}
                        slotY={slot.y}
                        slotSize={slot.size}
                        time={time}
                    />
                ) : null}

                {/* هاله‌ی شیشه‌ای روی همه‌چیز (فقط غیرفعال) */}
                {!active ? <GlassVeil width={width} height={height} /> : null}

                {/* باکس badge بالای هاله تا واضح بماند؛ با لمس کارت قفل می‌پرد */}
                {hasBadge ? (
                    <Animated.View
                        pointerEvents="none"
                        style={[styles.badgeSlot, {top: badgeOffset, end: badgeOffset}, badgeStyle]}>
                        <CardBadge label={item.badge} style={styles.badgeInline} />
                    </Animated.View>
                ) : null}
            </Animated.View>
        </GestureDetector>
    );
});

const styles = StyleSheet.create({
    surface: {
        position: 'absolute',
        left: -SURFACE_BLEED,
        top: -SURFACE_BLEED,
        right: -SURFACE_BLEED,
        bottom: -SURFACE_BLEED,
    },
    halo: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: CARD_R + 4,
        borderWidth: 2,
        borderColor: 'rgba(255,214,102,0.95)',
    },
    haloSoft: {
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        borderRadius: CARD_R + 10,
        borderWidth: 6,
        borderColor: 'rgba(255,214,102,0.18)',
    },
    slot: {
        position: 'absolute',
        borderRadius: SLOT_R,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textBox: {position: 'absolute', justifyContent: 'center'},
    subtitle: {color: colors.primary.a5, fontSize: 12, lineHeight: 19, marginTop: 2},
    tags: {marginTop: 4},
    badgeSlot: {position: 'absolute'},
    badgeInline: {position: 'relative'}, // جای‌گذاری با badgeSlot است تا پرش حول مرکز خود badge باشد
});

export default GameCard;