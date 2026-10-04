import React, {memo, useEffect, useMemo} from 'react';
import {I18nManager, StyleSheet, View} from 'react-native';
import {
    BlurMask,
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
import {
    Easing,
    cancelAnimation,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
const GOLD = ['#FFD666', '#F0B93B', '#C98E1F'];
const IS_RTL = I18nManager.isRTL;

const star = (x, y, s) =>
    `M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`;

const CHECK_R = 10;
const CHECK_INSET = 6;
const BAND_W = 70;

/**
 * قاب «انتخاب‌شده» برای آیتم‌های گرید؛ جایگزین بوردر رنگی ساده.
 * فقط وقتی آیتم انتخاب شده mount می‌شود، پس انیمیشن‌هایش برای آیتم‌های انتخاب‌نشده هزینه‌ای ندارند.
 *
 * عناصر:
 *  - قاب طلایی دوگانه (بیرونی پررنگ + درونی ظریف)
 *  - درخشش داخلی نفس‌کش و روشنایی طلایی از بالا
 *  - جاروی نور مورب
 *  - مهر تیک طلایی گوشه‌ی end که با فنر «ظاهر» می‌شود
 *  - دو جرقه‌ی چشمک‌زن
 *
 * کاملاً داخل Pressable می‌نشیند و لمس را نمی‌گیرد (pointerEvents none).
 *
 * offset: ضخامت بوردر والد. فرزند absolute در RN نسبت به «داخل بوردر» جای می‌گیرد؛ بدون این جبران،
 * کانواس به اندازه‌ی بوردر کوچک‌تر و جابه‌جا می‌شد و لبه‌ی پایین/end قاب نصفه بریده می‌شد.
 */
const SelectedFrame = memo(function SelectedFrame({width: w, height: h, radius = 15, offset = 0}) {
    const pulse = useSharedValue(0);
    const sweep = useSharedValue(0);
    const pop = useSharedValue(0);

    useEffect(() => {
        pulse.value = withRepeat(withTiming(1, {duration: 1400, easing: Easing.inOut(Easing.sin)}), -1, true);
        sweep.value = withRepeat(withTiming(1, {duration: 2800, easing: Easing.linear}), -1, false);
        pop.value = withSpring(1, {damping: 9, stiffness: 180});
        return () => {
            cancelAnimation(pulse);
            cancelAnimation(sweep);
            cancelAnimation(pop);
        };
    }, []);

    const clip = useMemo(() => rrect(rect(0, 0, w, h), radius, radius), [w, h, radius]);

    // مختصات فیزیکی مهر تیک در گوشه‌ی بالا-end
    const cx = IS_RTL ? CHECK_INSET + CHECK_R : w - CHECK_INSET - CHECK_R;
    const cy = CHECK_INSET + CHECK_R;
    const check = `M ${cx - 4.2} ${cy + 0.2} L ${cx - 1.2} ${cy + 3.2} L ${cx + 4.4} ${cy - 3.2}`;
    const sparkA = useMemo(() => star(IS_RTL ? w - 16 : 16, h - 16, 5), [w, h]);
    const sparkB = useMemo(() => star(IS_RTL ? cx + 17 : cx - 17, cy + 9, 3.5), [cx, cy]);

    // SharedValue فقط به‌صورت «کل prop» به Skia داده می‌شود
    const glowOpacity = useDerivedValue(() => 0.3 + 0.4 * pulse.value);
    const sparkAOp = useDerivedValue(() => pulse.value);
    const sparkBOp = useDerivedValue(() => 1 - pulse.value);
    const sweepT = useDerivedValue(() => {
        const p = Math.min(sweep.value * 1.6, 1); // ~۶۰٪ دوره در حال جاروب، بقیه مکث
        return [{translateX: -BAND_W + p * (w + BAND_W * 2)}, {skewX: -0.35}];
    }, [w]);
    const popT = useDerivedValue(() => [{scale: pop.value}]);

    return (
        <View pointerEvents="none" style={{position: 'absolute', left: -offset, top: -offset, width: w, height: h}}>
            <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                <Group clip={clip}>
                    {/* روشنایی طلایی از بالا */}
                    <Rect x={0} y={0} width={w} height={h}>
                        <RadialGradient c={vec(w / 2, 0)} r={w * 0.95} colors={['rgba(240,185,59,0.22)', 'rgba(240,185,59,0)']} />
                    </Rect>

                    {/* درخشش داخلی نفس‌کش (فقط نیمه‌ی داخلی دیده می‌شود) */}
                    <RoundedRect x={0} y={0} width={w} height={h} r={radius} style="stroke" strokeWidth={9} color="#F0B93B" opacity={glowOpacity}>
                        <BlurMask blur={5} style="normal" />
                    </RoundedRect>

                    {/* جاروی نور */}
                    <Group transform={sweepT}>
                        <Rect x={0} y={0} width={BAND_W} height={h}>
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(BAND_W, 0)}
                                colors={['rgba(255,240,190,0)', 'rgba(255,240,190,0.26)', 'rgba(255,240,190,0)']}
                            />
                        </Rect>
                    </Group>

                    {/* جرقه‌ها */}
                    <Path path={sparkA} color="#FFF6D2" opacity={sparkAOp} />
                    <Path path={sparkB} color="#FFF6D2" opacity={sparkBOp} />
                </Group>

                {/* قاب درونی ظریف */}
                <RoundedRect
                    x={5}
                    y={5}
                    width={w - 10}
                    height={h - 10}
                    r={Math.max(radius - 5, 4)}
                    style="stroke"
                    strokeWidth={1}
                    color="rgba(255,226,150,0.35)"
                />

                {/* قاب بیرونی طلایی */}
                <RoundedRect x={1.25} y={1.25} width={w - 2.5} height={h - 2.5} r={radius} style="stroke" strokeWidth={2.5}>
                    <LinearGradient start={vec(0, 0)} end={vec(w, h)} colors={GOLD} />
                </RoundedRect>

                {/* مهر تیک (با فنر ظاهر می‌شود) */}
                <Group origin={vec(cx, cy)} transform={popT}>
                    <Circle cx={cx} cy={cy} r={CHECK_R}>
                        <LinearGradient start={vec(cx - CHECK_R, cy - CHECK_R)} end={vec(cx + CHECK_R, cy + CHECK_R)} colors={GOLD} />
                        <Shadow dx={0} dy={1.5} blur={2} color="rgba(0,0,0,0.5)" />
                    </Circle>
                    <Circle cx={cx} cy={cy} r={CHECK_R} style="stroke" strokeWidth={1.2} color="#FFF1BF" />
                    <Path path={check} style="stroke" strokeWidth={2.4} strokeCap="round" strokeJoin="round" color="#4A3200" />
                </Group>
            </Canvas>
        </View>
    );
});

export default SelectedFrame;