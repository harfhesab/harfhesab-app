import React, {memo, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import {
    BlurMask,
    Canvas,
    Group,
    LinearGradient,
    Points,
    RadialGradient,
    Rect,
    vec,
} from '@shopify/react-native-skia';
import {runOnJS, useAnimatedReaction, useDerivedValue} from 'react-native-reanimated';
import IntroBurst from './IntroBurst';
import {INTRO_MS} from '../useHomeIntro';

const SKY_FADE_MS = 900; // روشن شدن آسمان در شروع صفحه

/**
 * پس‌زمینه‌ی آسمانی ساده: آسمان شب با دو درخشش نرم، و غبار طلایی که از آن می‌گذرد.
 * هیچ شکل ثابتی (کوه، ماه، نقش) وجود ندارد؛ فقط ذرات.
 *
 * عمق از سه لایه‌ی ذره می‌آید که هر کدام سرعت، اندازه، تاری و شفافیت خودشان را دارند:
 *   دور: ریز و تیز و آهسته  ←  میانی  ←  نزدیک: درشت و محو (بوکه) و سریع‌تر
 *
 * تنظیم ظاهر فقط با ویرایش آرایه‌ی LAYERS.
 *
 * props:
 *   width, height : اندازه‌ی ناحیه
 *   base          : رنگ بالای آسمان (رنگ تم، برای ادغام با هدر)
 *   time          : SharedValue زمان بر حسب میلی‌ثانیه (از useSceneClock)
 *   intro         : (اختیاری) clock ورود از useHomeIntro. اگر داده شود، آسمان تا شروع ورود
 *                   نامرئی است، بعد روشن می‌شود و انفجار نور (IntroBurst) در همین کانواس پخش می‌شود.
 */
const LAYERS = [
    {key: 'far', density: 9000, speed: 9, bob: 6, phase: 0.0, size: 2, blur: 0, color: 'rgba(190,235,230,0.40)', seed: 1},
    {key: 'mid', density: 22000, speed: 20, bob: 12, phase: 1.7, size: 3.5, blur: 1.2, color: 'rgba(255,226,150,0.55)', seed: 2},
    {key: 'near', density: 60000, speed: 42, bob: 20, phase: 3.1, size: 9, blur: 4, color: 'rgba(255,236,170,0.28)', seed: 3},
];

// تصادفی قطعی: نقاط هر بار یکسان ساخته می‌شوند
const mulberry32 = seed => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const scatter = (count, w, h, seed) => {
    const rnd = mulberry32(seed);
    return Array.from({length: count}, () => vec(rnd() * w, rnd() * h));
};

/* یک لایه‌ی غبار: حرکت آرام به راست + نوسان عمودی، با دو کپی برای حلقه‌ی بی‌درز */
const DustLayer = ({layer, w, h, time}) => {
    const {density, speed, bob, phase, size, blur, color, seed} = layer;

    const points = useMemo(() => {
        const count = Math.min(45, Math.max(3, Math.round((w * h) / density)));
        return scatter(count, w, h, seed);
    }, [w, h, density, seed]);

    // نکته: Skia مقدار SharedValue را فقط به‌صورت کل prop می‌پذیرد، نه داخل آیتم‌های آرایه‌ی transform
    const transform = useDerivedValue(() => {
        const s = time.value / 1000;
        return [{translateX: (s * speed) % w}, {translateY: Math.sin(s * 0.6 + phase) * bob}];
    }, [w]);

    const cloud = (
        <Points points={points} mode="points" color={color} style="stroke" strokeWidth={size} strokeCap="round">
            {blur > 0 && <BlurMask blur={blur} style="normal" />}
        </Points>
    );

    return (
        <Group transform={transform}>
            {cloud}
            <Group transform={[{translateX: -w}]}>{cloud}</Group>
        </Group>
    );
};

const DustBackdrop = memo(function DustBackdrop({width: w, height: h, base, time, intro}) {
    // انفجار نور فقط تا پایان تایم‌لاین ورود در درخت می‌ماند؛ بعد حذف می‌شود تا هر فریم هزینه نداشته باشد
    const [burstDone, setBurstDone] = useState(!intro);

    const sceneOpacity = useDerivedValue(() => {
        if (!intro) {
            return 1;
        }
        const k = 1 - Math.min(1, intro.value / SKY_FADE_MS);
        return 1 - k * k * k;
    });

    useAnimatedReaction(
        () => (intro ? intro.value >= INTRO_MS : true),
        (done, previous) => {
            if (done && !previous) {
                runOnJS(setBurstDone)(true);
            }
        },
    );

    return (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Group opacity={sceneOpacity}>
                {/* آسمان */}
                <Rect x={0} y={0} width={w} height={h}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(0, h)}
                        colors={[base, '#0A2A31', '#05141A']}
                        positions={[0, 0.5, 1]}
                    />
                </Rect>

                {/* دو درخشش نرم: طلایی از بالا، فیروزه‌ای از پایین */}
                <Rect x={0} y={0} width={w} height={h}>
                    <RadialGradient
                        c={vec(w * 0.5, 0)}
                        r={w * 0.9}
                        colors={['rgba(240,185,59,0.16)', 'rgba(240,185,59,0)']}
                    />
                </Rect>
                <Rect x={0} y={0} width={w} height={h}>
                    <RadialGradient
                        c={vec(w, h)}
                        r={w * 1.1}
                        colors={['rgba(39,181,163,0.14)', 'rgba(39,181,163,0)']}
                    />
                </Rect>

                {/* غبار: از دور به نزدیک */}
                {LAYERS.map(layer => (
                    <DustLayer key={layer.key} layer={layer} w={w} h={h} time={time} />
                ))}
            </Group>

            {/* انفجار نور شروع صفحه (بدون کانواس اضافه) */}
            {burstDone ? null : <IntroBurst width={w} height={h} clock={intro} />}
        </Canvas>
    );
});

export default DustBackdrop;
