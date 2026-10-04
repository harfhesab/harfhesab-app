import React, {memo, useCallback, useMemo} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {
    Canvas,
    Circle,
    Group,
    LinearGradient,
    Path,
    RadialGradient,
    Rect,
    RoundedRect,
    Shadow,
    rect,
    rrect,
    vec,
} from '@shopify/react-native-skia';
import Animated, {useAnimatedStyle, useDerivedValue} from 'react-native-reanimated';
import {BLEED, GOLD, IS_RTL} from '../homeConfig';
import Font from '../../../utils/Font';

/* ═════════════ ابعاد ═════════════ */
const AD_H = 60; // ارتفاع کل (با لبه‌ی سه‌بعدی)
const AD_LIP = 4;
const FACE_H = AD_H - AD_LIP;
const AD_R = 22;

const COIN_BOX = 56; // کانواس سکه (جا برای هاله و جرقه‌ها)
const COIN_C = COIN_BOX / 2;
const COIN_IMG = 30; // اندازه‌ی تصویر سکه (dp)؛ هر عددی بخواهید
const COIN_R = COIN_IMG / 2;
const COIN_START = 8; // فاصله‌ی کانواس سکه از لبه‌ی start

const SHIMMER_W = 80;
const DIR = IS_RTL ? -1 : 1; // جهت «جلو» در خواندن (راست در LTR، چپ در RTL)

// ستاره‌ی چهارپر (جرقه)
const star = (x, y, s) =>
    `M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`;
const SPARK_A = star(COIN_C + 18, COIN_C - 14, 5);
const SPARK_B = star(COIN_C - 19, COIN_C + 12, 3.4);
const SPARK_C = star(COIN_C + 13, COIN_C + 19, 2.6);

// آرایه‌ی ثابت برای حالت بیکار (بدون رسم مجدد). نکته: SharedValue باید «کل» prop باشد،
// نه داخل آیتم‌های آرایه‌ی transform؛ پس هر derived کل آرایه را برمی‌گرداند.
const SHINE_IDLE = [{translateX: 40}, {skewX: -0.4}];

/* ═════════════ سکه‌ی متحرک ═════════════
   تصویر واقعی سکه‌ی بازی (RN Image) + افکت‌های Skia دور و روی آن:
     پشت تصویر : هاله‌ی طلایی نفس‌کش
     خود تصویر : شناوری ملایم (Reanimated)
     روی تصویر : انعکاس نور (محدود به دایره‌ی سکه) + سه جرقه‌ی چشمک‌زن
   هر دو کانواس کوچک‌اند و جدا از بدنه‌ی دکمه رسم می‌شوند. */
const BOB = t => {
    'worklet';
    return Math.sin(t / 700) * 1.6;
};

const CoinIcon = memo(function CoinIcon({time}) {
    const coinClip = useMemo(
        () => rrect(rect(COIN_C - COIN_R, COIN_C - COIN_R, COIN_IMG, COIN_IMG), COIN_R, COIN_R),
        [],
    );

    // تصویر RN و گروه Skia روی آن هر دو با همان فرمول شناور می‌شوند تا هم‌حرکت بمانند
    const imageStyle = useAnimatedStyle(() => ({transform: [{translateY: BOB(time.value)}]}));
    const bob = useDerivedValue(() => [{translateY: BOB(time.value)}]);

    const glow = useDerivedValue(() => 0.65 + 0.35 * Math.sin(time.value / 600));
    const shine = useDerivedValue(() => {
        const p = Math.min(((time.value + 900) % 3200) / 900, 1);
        if (p >= 1) {
            return SHINE_IDLE;
        }
        return [{translateX: -26 + p * 52}, {skewX: -0.4}];
    });
    const sparkA = useDerivedValue(() => 0.5 + 0.5 * Math.sin(time.value / 380));
    const sparkB = useDerivedValue(() => 0.5 + 0.5 * Math.sin(time.value / 380 + 2.1));
    const sparkC = useDerivedValue(() => 0.5 + 0.5 * Math.sin(time.value / 380 + 4.2));

    const boxTop = (FACE_H - COIN_BOX) / 2;
    const boxStyle = {position: 'absolute', start: COIN_START, top: boxTop, width: COIN_BOX, height: COIN_BOX};

    return (
        <>
            {/* پشت: هاله */}
            <Canvas pointerEvents="none" style={boxStyle}>
                <Circle cx={COIN_C} cy={COIN_C} r={26} opacity={glow}>
                    <RadialGradient c={vec(COIN_C, COIN_C)} r={26} colors={['rgba(255,214,102,0.5)', 'rgba(255,214,102,0)']} />
                </Circle>
            </Canvas>

            {/* تصویر واقعی سکه */}
            <Animated.View
                pointerEvents="none"
                style={[
                    {
                        position: 'absolute',
                        start: COIN_START + COIN_C - COIN_R,
                        top: boxTop + COIN_C - COIN_R,
                        width: COIN_IMG,
                        height: COIN_IMG,
                    },
                    imageStyle,
                ]}>
                <Image
                    style={{height: COIN_IMG, width: COIN_IMG}}
                    resizeMode="contain"
                    source={require('../../../assets/image/coin.png')}
                />
            </Animated.View>

            {/* روی تصویر: انعکاس نور + جرقه‌ها */}
            <Canvas pointerEvents="none" style={boxStyle}>
                <Group transform={bob}>
                    <Group clip={coinClip}>
                        <Group transform={shine}>
                            <Rect x={COIN_C - 6} y={COIN_C - COIN_R} width={12} height={COIN_IMG}>
                                <LinearGradient
                                    start={vec(COIN_C - 6, 0)}
                                    end={vec(COIN_C + 6, 0)}
                                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']}
                                />
                            </Rect>
                        </Group>
                    </Group>
                    <Path path={SPARK_A} color="#FFF6D2" opacity={sparkA} />
                    <Path path={SPARK_B} color="#FFF6D2" opacity={sparkB} />
                    <Path path={SPARK_C} color="#FFF6D2" opacity={sparkC} />
                </Group>
            </Canvas>
        </>
    );
});

/* ═════════════ جاروی نور ═════════════
   کانواس جدا؛ دوره‌اش با دکمه‌ی ادامه هم‌زمان نمی‌شود تا دو دکمه با هم چشمک نزنند. */
const ShimmerSweep = memo(function ShimmerSweep({width, time}) {
    const clip = useMemo(() => rrect(rect(0, 0, width, FACE_H), AD_R, AD_R), [width]);
    const idle = useMemo(() => [{translateX: width + 100}, {skewX: -0.35}], [width]);

    const transform = useDerivedValue(() => {
        const p = Math.min(((time.value + 1800) % 5200) / 1500, 1);
        if (p >= 1) {
            return idle;
        }
        return [{translateX: -100 + p * (width + 200)}, {skewX: -0.35}];
    }, [width, idle]);

    return (
        <Canvas pointerEvents="none" style={{position: 'absolute', left: 0, top: 0, width, height: FACE_H}}>
            <Group clip={clip}>
                <Group transform={transform}>
                    <Rect x={0} y={0} width={SHIMMER_W} height={FACE_H}>
                        <LinearGradient
                            start={vec(0, 0)}
                            end={vec(SHIMMER_W, 0)}
                            colors={['rgba(255,226,150,0)', 'rgba(255,226,150,0.32)', 'rgba(255,226,150,0)']}
                        />
                    </Rect>
                </Group>
            </Group>
        </Canvas>
    );
});

/**
 * دکمه‌ی نازک «تبلیغ ببین، N سکه بگیر».
 *
 * props:
 *   width    : عرض (معمولاً layout.contentWidth)
 *   reward   : تعداد سکه (پیش‌فرض ۲۰)
 *   time     : SharedValue زمان از useSceneClock
 *   onPress  : تابع کلیک (نمایش تبلیغ را شما هندل می‌کنید)
 *   disabled : مثلاً تا آماده‌شدن تبلیغ؛ دکمه کم‌رنگ و غیرقابل‌لمس می‌شود
 *
 * ظاهر: شیشه‌ی تیره‌ی زمردی با قاب طلایی (نه رنگ‌های جیغ تبلیغاتی)، سکه‌ی متحرک با جرقه،
 * جاروی نور و فلش جهت‌دار؛ تا کنار بقیه‌ی کارت‌ها ارزان و مزاحم دیده نشود.
 */
const AdRewardButton = memo(function AdRewardButton({width, reward = 20, time, onPress, disabled = false}) {
    const handlePress = useCallback(() => onPress && onPress(), [onPress]);
    const faceClip = useMemo(() => rrect(rect(0, 0, width, FACE_H), AD_R, AD_R), [width]);

    // مختصات فیزیکی برای Skia
    const coinX = IS_RTL ? width - (COIN_START + COIN_C) : COIN_START + COIN_C;
    const arrowX = IS_RTL ? 14 + 13 : width - 14 - 13;
    const arrowY = FACE_H / 2;
    const chevron = `M ${arrowX - 3 * DIR} ${arrowY - 6} L ${arrowX + 3 * DIR} ${arrowY} L ${arrowX - 3 * DIR} ${arrowY + 6}`;

    const label = `تبلیغ ببین، ${reward} سکه بگیر!`;

    return (
        <Pressable
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{disabled}}
            onPress={handlePress}
            style={({pressed}) => [{width, height: AD_H}, disabled && styles.disabled, pressed && styles.pressed]}>
            {/* بدنه‌ی ثابت (با BLEED تا سایه بریده نشود) */}
            <Canvas
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    left: -BLEED,
                    top: -BLEED,
                    width: width + BLEED * 2,
                    height: AD_H + BLEED * 2,
                }}>
                <Group transform={[{translateX: BLEED}, {translateY: BLEED}]}>
                    {/* لبه‌ی سه‌بعدی */}
                    <RoundedRect x={0} y={AD_LIP} width={width} height={FACE_H} r={AD_R} color="#031210" />

                    {/* سطح: زمرد تیره + درخشش طلایی ملایم */}
                    <RoundedRect x={0} y={0} width={width} height={FACE_H} r={AD_R}>
                        <LinearGradient start={vec(0, 0)} end={vec(width, 0)} colors={['#11504A', '#0B312E', '#0A2422']} />
                        <Shadow dx={0} dy={3} blur={5} color="rgba(240,185,59,0.22)" />
                    </RoundedRect>

                    <Group clip={faceClip}>
                        {/* نور طلایی پشت سکه */}
                        <Circle cx={coinX} cy={FACE_H / 2} r={80}>
                            <RadialGradient c={vec(coinX, FACE_H / 2)} r={80} colors={['rgba(240,185,59,0.26)', 'rgba(240,185,59,0)']} />
                        </Circle>
                        {/* براقی بالا */}
                        <Rect x={0} y={0} width={width} height={FACE_H * 0.5}>
                            <LinearGradient start={vec(0, 0)} end={vec(0, FACE_H * 0.5)} colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']} />
                        </Rect>
                    </Group>

                    {/* قاب طلایی */}
                    <RoundedRect x={0.75} y={0.75} width={width - 1.5} height={FACE_H - 1.5} r={AD_R} style="stroke" strokeWidth={1.5}>
                        <LinearGradient start={vec(0, 0)} end={vec(width, FACE_H)} colors={GOLD} />
                    </RoundedRect>

                    {/* فلش جهت‌دار */}
                    <Circle cx={arrowX} cy={arrowY} r={13} style="stroke" strokeWidth={1.5} color="rgba(255,214,102,0.5)" />
                    <Path path={chevron} style="stroke" strokeWidth={2.5} strokeCap="round" strokeJoin="round" color={GOLD[0]} />
                </Group>
            </Canvas>

            <ShimmerSweep width={width} time={time} />
            <CoinIcon time={time} />

            <View style={styles.textBox} pointerEvents="none">
                <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
                    تبلیغ ببین،{' '}
                    <Text style={styles.reward}>{reward} سکه</Text>
                    {' '}بگیر!
                </Text>
            </View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    pressed: {opacity: 0.92, transform: [{scale: 0.97}]},
    disabled: {opacity: 0.5},
    textBox: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: FACE_H,
        justifyContent: 'center',
        paddingStart: COIN_START + COIN_BOX + 2,
        paddingEnd: 14 + 26 + 10,
    },
    text: {
        color: '#F4EBD6',
        fontSize: 17,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 3,
        fontFamily:Font.bakh_bold,
    },
    reward: {color: GOLD[0]},
});

export default AdRewardButton;