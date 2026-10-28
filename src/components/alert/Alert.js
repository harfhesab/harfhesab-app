import React, { useState, useImperativeHandle, useEffect, useMemo, useRef, memo } from 'react';
import { View, Dimensions, TouchableOpacity, Text, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import {
    Canvas, Group, Rect, RoundedRect, Circle, Path, LinearGradient, RadialGradient,
    SweepGradient, BlurMask, Skia, vec, rect, rrect,
} from '@shopify/react-native-skia';
import Animated, {
    useSharedValue, useAnimatedStyle, useDerivedValue, withSpring, withTiming,
    withRepeat, withSequence, withDelay, cancelAnimation, interpolate, Easing,
} from 'react-native-reanimated';
import Font from '../../utils/Font';
import Icon from '../../utils/Icon';
import ButtonBorder from '../buttons/ButtonBorder';
import ButtonGradient from '../buttons/ButtonGradient';
import LottieView from 'lottie-react-native';
import useAppTheme from '../../hooks/theme/useAppTheme';

const { width } = Dimensions.get('window');

const GLOW = 18;          // فضای اضافه‌ی کانواس برای هاله‌ی دور کارت
const RADIUS = 14;        // شعاع گوشه‌های کارت
const HEADER_H = 80;      // ارتفاع هدر (مثل قبل)
const MEDAL = 100;        // اندازه‌ی مدال آیکون (مثل قبل)
const MEDAL_CANVAS = 150; // کانواس مدال (با فضای هاله)
const TWO_PI = Math.PI * 2;

const LOTTIES = {
    success: require('../../assets/lottie/success.json'),
    error: require('../../assets/lottie/alert.json'),
    info: require('../../assets/lottie/info.json'),
    warning: require('../../assets/lottie/warn.json'),
    question: require('../../assets/lottie/question.json'),
};

/* ------------------------------------------------------------------ */
/*  ستاره‌ی چشمک‌زن داخل هدر                                           */
/* ------------------------------------------------------------------ */
const Sparkle = ({ x, y, size, phase, t }) => {
    const path = useMemo(() => Skia.Path.MakeFromSVGString(
        `M${x} ${y - size} Q${x} ${y} ${x + size} ${y} Q${x} ${y} ${x} ${y + size} Q${x} ${y} ${x - size} ${y} Q${x} ${y} ${x} ${y - size}Z`
    ), [x, y, size]);
    const opacity = useDerivedValue(() => {
        const v = Math.sin((t.value + phase) * TWO_PI);
        return v > 0 ? v : 0;
    });
    const transform = useDerivedValue(() => [{ scale: 0.5 + opacity.value * 0.5 }]);
    if (!path) return null;
    return (
        <Group origin={{ x, y }} transform={transform} opacity={opacity}>
            <Path path={path} color="#FFFFFF" />
        </Group>
    );
};

/* ------------------------------------------------------------------ */
/*  بدنه‌ی کارت: هاله، پس‌زمینه، هدر، حاشیه‌ی گرادیانی                    */
/* ------------------------------------------------------------------ */
const CardSkia = memo(({ w, h, typeColors, bg, borderColor, shineX, t }) => {
    const c0 = typeColors[0];
    const c1 = typeColors[typeColors.length - 1];

    const clip = useMemo(() => rrect(rect(0, 0, w, h), RADIUS, RADIUS), [w, h]);

    const stripes = useMemo(() => {
        const p = Skia.Path.Make();
        for (let x = -HEADER_H; x < w; x += 16) {
            p.moveTo(x, HEADER_H);
            p.lineTo(x + HEADER_H, 0);
        }
        return p;
    }, [w]);

    const shineTransform = useDerivedValue(() => [
        { translateX: shineX.value },
        { skewX: -0.35 },
    ]);

    const sparkles = useMemo(() => ([
        { x: w * 0.12, y: 22, size: 6, phase: 0 },
        { x: w * 0.27, y: 58, size: 4, phase: 0.35 },
        { x: w * 0.73, y: 20, size: 5, phase: 0.6 },
        { x: w * 0.88, y: 52, size: 7, phase: 0.15 },
    ]), [w]);

    return (
        <View pointerEvents="none" style={{ position: 'absolute', left: -GLOW, top: -GLOW }}>
            <Canvas style={{ width: w + GLOW * 2, height: h + GLOW * 2 }}>
                <Group transform={[{ translateX: GLOW }, { translateY: GLOW }]}>
                    {/* هاله‌ی رنگی دور کارت */}
                    <RoundedRect x={0} y={4} width={w} height={h} r={RADIUS} color={c0} opacity={0.5}>
                        <BlurMask blur={14} style="normal" />
                    </RoundedRect>

                    <Group clip={clip}>
                        {/* پس‌زمینه */}
                        <Rect x={0} y={0} width={w} height={h} color={bg} />
                        <Rect x={0} y={0} width={w} height={h}>
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(0, h)}
                                colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.28)']}
                            />
                        </Rect>

                        {/* هدر */}
                        <Rect x={0} y={0} width={w} height={HEADER_H}>
                            <LinearGradient start={vec(0, 0)} end={vec(w, HEADER_H)} colors={typeColors} />
                        </Rect>
                        <Path path={stripes} style="stroke" strokeWidth={6} color="rgba(255,255,255,0.07)" />
                        <Rect x={0} y={0} width={w} height={HEADER_H / 2}>
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(0, HEADER_H / 2)}
                                colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
                            />
                        </Rect>

                        {/* برق عبوری */}
                        <Group transform={shineTransform}>
                            <Rect x={0} y={-10} width={40} height={HEADER_H + 20}>
                                <LinearGradient
                                    start={vec(0, 0)}
                                    end={vec(40, 0)}
                                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
                                />
                            </Rect>
                        </Group>

                        {sparkles.map((s, i) => <Sparkle key={i} t={t} {...s} />)}

                        {/* لبه‌ی پایین هدر */}
                        <Rect x={0} y={HEADER_H} width={w} height={3}>
                            <LinearGradient start={vec(0, 0)} end={vec(w, 0)} colors={[c0, c1, c0]} />
                        </Rect>
                        <Rect x={0} y={HEADER_H + 3} width={w} height={1} color="rgba(255,255,255,0.12)" />
                    </Group>

                    {/* حاشیه‌ی گرادیانی و خط داخلی */}
                    <RoundedRect x={1} y={1} width={w - 2} height={h - 2} r={RADIUS - 1} style="stroke" strokeWidth={2}>
                        <LinearGradient start={vec(0, 0)} end={vec(w, h)} colors={[c1, borderColor, c0]} />
                    </RoundedRect>
                    <RoundedRect
                        x={4} y={4} width={w - 8} height={h - 8} r={RADIUS - 4}
                        style="stroke" strokeWidth={1} color="rgba(255,255,255,0.08)"
                    />

                    {/* پیچ‌های گوشه */}
                    {[[12, 12], [w - 12, 12], [12, h - 12], [w - 12, h - 12]].map(([cx, cy], i) => (
                        <Group key={i}>
                            <Circle cx={cx} cy={cy} r={3.2} color="rgba(0,0,0,0.35)" />
                            <Circle cx={cx} cy={cy} r={2.4} color="rgba(255,255,255,0.6)" />
                        </Group>
                    ))}
                </Group>
            </Canvas>
        </View>
    );
});

/* ------------------------------------------------------------------ */
/*  مدال آیکون: هاله‌ی پالسی + حلقه‌ی چرخان                              */
/* ------------------------------------------------------------------ */
const MedalSkia = memo(({ typeColors, bg, borderColor, rot, pulse }) => {
    const c0 = typeColors[0];
    const c1 = typeColors[typeColors.length - 1];
    const c = MEDAL_CANVAS / 2;

    const ringTransform = useDerivedValue(() => [{ rotate: rot.value }]);
    const glowOpacity = useDerivedValue(() => 0.25 + pulse.value * 0.45);

    return (
        <Canvas style={{ position: 'absolute', width: MEDAL_CANVAS, height: MEDAL_CANVAS }}>
            <Circle cx={c} cy={c} r={MEDAL / 2 + 8} color={c0} opacity={glowOpacity}>
                <BlurMask blur={14} style="normal" />
            </Circle>

            <Group origin={vec(c, c)} transform={ringTransform}>
                <Circle cx={c} cy={c} r={MEDAL / 2 + 5} style="stroke" strokeWidth={3}>
                    <SweepGradient c={vec(c, c)} colors={[c1, c0, 'transparent', c1]} positions={[0, 0.4, 0.75, 1]} />
                </Circle>
            </Group>

            <Circle cx={c} cy={c} r={MEDAL / 2} color={bg} />
            <Circle cx={c} cy={c} r={MEDAL / 2}>
                <RadialGradient
                    c={vec(c, c - 14)}
                    r={MEDAL / 2 + 6}
                    colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
                />
            </Circle>
            <Circle cx={c} cy={c} r={MEDAL / 2 - 1.5} style="stroke" strokeWidth={3} color={borderColor} />
        </Canvas>
    );
});

/* ------------------------------------------------------------------ */
/*  کامپوننت اصلی (API و عملکرد بدون تغییر)                             */
/* ------------------------------------------------------------------ */
const Alert = React.forwardRef((props, ref) => {
    const colors = useAppTheme();
    const contentWidth = width - 60;

    const [visible, setVisible] = useState(false);
    const [cancelable, setCancelable] = useState(true);
    const [type, setType] = useState('info');
    const [buttons, setButtons] = useState(null);
    const [iconName, setIconName] = useState(null);
    const [iconType, setIconType] = useState(null);
    const [iconColor, setIconColor] = useState(null);
    const [body, setBody] = useState('');
    const [bodyAlign, setBodyAlign] = useState(null);
    const [textAlign, setTextAlign] = useState(null);
    const [lineHeight, setlineHeight] = useState(null);
    const [bodyTextSize, setBodyTextSize] = useState(null);
    const [bodyFontFamily, setBodyFontFamily] = useState(null);
    const [cardH, setCardH] = useState(0);

    const visibleRef = useRef(false);

    // مقادیر انیمیشن
    const progress = useSharedValue(0);   // ورود کارت
    const medalPop = useSharedValue(0);   // پاپ مدال
    const shineX = useSharedValue(-80);   // برق هدر
    const rot = useSharedValue(0);        // چرخش حلقه
    const pulse = useSharedValue(0);      // ضربان هاله
    const t = useSharedValue(0);          // زمان برای ستاره‌ها

    const typeColors = useMemo(() => {
        const arr = colors.alert_component[type] ?? colors.alert_component.info;
        return arr.length > 1 ? arr : [arr[0], arr[0]];
    }, [colors, type]);

    const open = (dialog) => {
        visibleRef.current = true;
        setVisible(true);
        setCancelable(dialog?.options?.cancelable ?? true);
        setType(dialog?.options?.type ?? 'info');
        setButtons(dialog?.buttons ?? null);
        setIconName(dialog?.options?.iconName ?? null);
        setIconType(dialog?.options?.iconType ?? null);
        setIconColor(dialog?.options?.iconColor ?? null);
        setBody(dialog?.body ?? '');
        setBodyAlign(dialog?.options?.bodyAlign ?? null);
        setTextAlign(dialog?.options?.textAlign ?? null);
        setlineHeight(dialog?.options?.lineHeight ?? null);
        setBodyTextSize(dialog?.options?.bodyTextSize ?? null);
        setBodyFontFamily(dialog?.options?.bodyFontFamily ?? null);
    };

    const close = () => {
        visibleRef.current = false;
        setVisible(false);
    };

    // بازنشانی بعد از پایان انیمیشن بسته شدن (جایگزین تایمر قبلی که هیچ‌وقت اجرا نمی‌شد)
    const resetAfterHide = () => {
        cancelAnimation(shineX);
        cancelAnimation(rot);
        cancelAnimation(pulse);
        cancelAnimation(t);
        progress.value = 0;
        medalPop.value = 0;
        if (visibleRef.current) return; // در همین فاصله دوباره باز شده
        setCancelable(true);
        setType('info');
        setButtons(null);
        setIconName(null);
        setIconType(null);
        setIconColor(null);
        setBody('');
        setBodyAlign(null);
        setTextAlign(null);
        setlineHeight(null);
        setBodyTextSize(null);
        setBodyFontFamily(null);
        setCardH(0);
    };

    useImperativeHandle(ref, () => ({ open }));

    // شروع انیمیشن‌ها هنگام نمایش
    useEffect(() => {
        if (!visible) return;
        progress.value = withSpring(1, { damping: 14, stiffness: 150, mass: 0.9 });
        medalPop.value = withDelay(140, withSpring(1, { damping: 9, stiffness: 180 }));

        shineX.value = -80;
        shineX.value = withRepeat(
            withSequence(
                withDelay(1600, withTiming(contentWidth + 40, { duration: 1000, easing: Easing.inOut(Easing.quad) })),
                withTiming(-80, { duration: 0 }),
            ),
            -1,
        );
        rot.value = 0;
        rot.value = withRepeat(withTiming(TWO_PI, { duration: 4500, easing: Easing.linear }), -1);
        pulse.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
            ),
            -1,
        );
        t.value = 0;
        t.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.linear }), -1);
    }, [visible]);

    const cardStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.6], [0, 1], 'clamp'),
        transform: [
            { translateY: interpolate(progress.value, [0, 1], [26, 0]) },
            { scale: interpolate(progress.value, [0, 1], [0.8, 1]) },
        ],
    }));
    const medalStyle = useAnimatedStyle(() => ({
        transform: [{ scale: medalPop.value }],
    }));
    const contentStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0.35, 1], [0, 1], 'clamp'),
        transform: [{ translateY: interpolate(progress.value, [0.35, 1], [8, 0], 'clamp') }],
    }));

    const lottieSource = LOTTIES[type] ?? LOTTIES.info;

    return (
        <Modal
            animationIn={'fadeIn'}
            animationOut={'fadeOut'}
            animationInTiming={220}
            animationOutTiming={200}
            backdropOpacity={0.75}
            isVisible={visible}
            onBackdropPress={() => {
                if (cancelable == true) {
                    close();
                }
            }}
            useNativeDriverForBackdrop={true}
            onBackButtonPress={() => {
                if (cancelable == true) {
                    close();
                }
            }}
            onModalHide={resetAfterHide}
        >
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <Animated.View
                    onLayout={(e) => setCardH(e.nativeEvent.layout.height)}
                    style={[
                        {
                            width: contentWidth,
                            margin: 20,
                            backgroundColor: colors.alert_component.background,
                            borderRadius: RADIUS,
                            alignItems: 'center',
                        },
                        cardStyle,
                    ]}
                >
                    {cardH > 0 && (
                        <CardSkia
                            w={contentWidth}
                            h={cardH}
                            typeColors={typeColors}
                            bg={colors.alert_component.background}
                            borderColor={colors.border.a1}
                            shineX={shineX}
                            t={t}
                        />
                    )}

                    {/* فضای هدر */}
                    <View style={{ width: contentWidth, height: HEADER_H }} />

                    {/* مدال آیکون */}
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            {
                                position: 'absolute',
                                top: 10 + MEDAL / 2 - MEDAL_CANVAS / 2,
                                width: MEDAL_CANVAS,
                                height: MEDAL_CANVAS,
                                alignItems: 'center',
                                justifyContent: 'center',
                            },
                            medalStyle,
                        ]}
                    >
                        <MedalSkia
                            typeColors={typeColors}
                            bg={colors.alert_component.background}
                            borderColor={colors.border.a1}
                            rot={rot}
                            pulse={pulse}
                        />
                        <View
                            style={{
                                width: MEDAL,
                                height: MEDAL,
                                borderRadius: MEDAL / 2,
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            {(iconName && iconType) ? (
                                <Icon
                                    name={iconName}
                                    type={iconType}
                                    style={{ fontSize: 40, color: iconColor ?? colors.text.a2 }}
                                />
                            ) : (
                                <LottieView
                                    style={{ width: MEDAL, height: MEDAL }}
                                    source={lottieSource}
                                    autoPlay
                                    loop={false}
                                />
                            )}
                        </View>
                    </Animated.View>

                    {/* متن */}
                    <Animated.View
                        style={[
                            {
                                maxHeight: 300,
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingVertical: 15,
                                paddingHorizontal: 15,
                                marginTop: 15,
                                width: contentWidth,
                            },
                            contentStyle,
                        ]}
                    >
                        <ScrollView
                            style={{ flexGrow: 0 }}
                            contentContainerStyle={{ width: '100%', alignItems: bodyAlign ?? 'center' }}
                        >
                            <Text
                                style={{
                                    fontSize: bodyTextSize ?? 14,
                                    fontFamily: bodyFontFamily ?? Font.bakh_semi_bold,
                                    color: colors.text.a2,
                                    textAlign: textAlign ?? 'center',
                                    marginVertical: 10,
                                    lineHeight: lineHeight ?? 32,
                                }}
                            >
                                {body}
                            </Text>
                        </ScrollView>
                    </Animated.View>

                    {/* دکمه‌ها */}
                    {(buttons && buttons.length > 0) && (
                        <Animated.View
                            style={[
                                {
                                    width: '100%',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: !buttons[0]?.type ? 'flex-end' : 'center',
                                    gap: !buttons[0]?.type ? 30 : 10,
                                    marginBottom: 15,
                                    paddingHorizontal: 15,
                                },
                                contentStyle,
                            ]}
                        >
                            {buttons.map((item, index) => (
                                (item?.type == 'border') ? (
                                    <ButtonBorder
                                        key={index.toString()}
                                        text={item.text}
                                        height={item?.height ?? 45}
                                        width={item?.width ?? (buttons.length > 1 ? (contentWidth / 2) - 20 : (contentWidth / 2) + 20)}
                                        loading={false}
                                        onPress={() => {
                                            item.onPress();
                                            close();
                                        }}
                                        borderRadius={item?.borderRadius ?? 10}
                                        textSize={item?.textSize ?? 14}
                                        borderColor={item?.color ?? undefined}
                                    />
                                ) : (item?.type == 'bold') ? (
                                    <ButtonGradient
                                        key={index.toString()}
                                        text={item.text}
                                        height={item?.height ?? 45}
                                        width={item?.width ?? (buttons.length > 1 ? (contentWidth / 2) - 20 : (contentWidth / 2) + 20)}
                                        loading={false}
                                        onPress={() => {
                                            item.onPress();
                                            close();
                                        }}
                                        borderRadius={item?.borderRadius ?? 10}
                                        textSize={item?.textSize ?? 14}
                                    />
                                ) : (
                                    <TouchableOpacity
                                        key={index.toString()}
                                        activeOpacity={0.6}
                                        onPress={() => {
                                            item.onPress();
                                            close();
                                        }}
                                        style={{ alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text
                                            style={{
                                                fontFamily: Font.bakh_bold,
                                                fontSize: item?.textSize ?? 16,
                                                color: item?.color ?? colors.primary.a1,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {item.text}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            ))}
                        </Animated.View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
});

export default memo(Alert);