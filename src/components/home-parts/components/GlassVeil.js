import React, {memo, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {
    BlurMask,
    Canvas,
    Group,
    LinearGradient,
    Path,
    Rect,
    RoundedRect,
    rect,
    rrect,
    vec,
} from '@shopify/react-native-skia';
import {CARD_R} from '../homeConfig';

/**
 * هاله‌ی شیشه‌ای مات برای کارت‌های غیرفعال (active: false).
 * پارامتر اختیاری offset: ضخامت بوردر والد (برای جبران جای‌گیری absolute داخل بوردر).
 * پارامتر اختیاری radius: گردی گوشه‌ها (پیش‌فرض CARD_R؛ برای آیتم‌های کوچک‌تر مثل GridItem عدد کوچک‌تر بدهید).
 * باید «بعد از» تصویر و متن رندر شود (روی آن‌ها بنشیند) و کاملاً ثابت است.
 *
 * لایه‌ها: بدنه‌ی مات یخی ← دو نوار انعکاس مورب ← درخشش داخلی ← لبه‌ی شیشه‌ای
 */
const GlassVeil = memo(function GlassVeil({width: w, height: h, radius = CARD_R, offset = 0}) {
    const clip = useMemo(() => rrect(rect(0, 0, w, h), radius, radius), [w, h, radius]);

    // نوارهای انعکاس مورب (متوازی‌الاضلاع)
    const bandWide = `M ${w * 0.12} 0 L ${w * 0.42} 0 L ${w * 0.1} ${h} L ${-w * 0.2} ${h} Z`;
    const bandThin = `M ${w * 0.5} 0 L ${w * 0.56} 0 L ${w * 0.24} ${h} L ${w * 0.18} ${h} Z`;

    return (
        <View pointerEvents="none" style={{position: 'absolute', left: -offset, top: -offset, width: w, height: h}}>
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Group clip={clip}>
                {/* بدنه‌ی مات: بالا روشن و یخی، پایین تیره‌ی آبی */}
                <Rect x={0} y={0} width={w} height={h}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(w, h)}
                        colors={['rgba(215,232,246,0.36)', 'rgba(120,150,176,0.26)', 'rgba(10,22,34,0.55)']}
                        positions={[0, 0.45, 1]}
                    />
                </Rect>

                {/* انعکاس نور روی شیشه */}
                <Path path={bandWide}>
                    <LinearGradient
                        start={vec(w * 0.1, 0)}
                        end={vec(w * 0.42, 0)}
                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.17)', 'rgba(255,255,255,0)']}
                    />
                </Path>
                <Path path={bandThin}>
                    <LinearGradient
                        start={vec(w * 0.2, 0)}
                        end={vec(w * 0.56, 0)}
                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
                    />
                </Path>

                {/* درخشش نرم داخل لبه‌ها */}
                <RoundedRect x={0} y={0} width={w} height={h} r={radius} style="stroke" strokeWidth={10} color="rgba(255,255,255,0.14)">
                    <BlurMask blur={7} style="normal" />
                </RoundedRect>
            </Group>

            {/* لبه‌ی شیشه: بالا-روشن، پایین-کم‌رنگ */}
            <RoundedRect x={0.75} y={0.75} width={w - 1.5} height={h - 1.5} r={radius} style="stroke" strokeWidth={1.5}>
                <LinearGradient
                    start={vec(0, 0)}
                    end={vec(w, h)}
                    colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.3)']}
                />
            </RoundedRect>
        </Canvas>
        </View>
    );
});

export default GlassVeil;