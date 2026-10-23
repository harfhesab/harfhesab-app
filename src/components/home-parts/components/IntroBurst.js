import React, {memo, useMemo} from 'react';
import {Circle, Group, Path, RadialGradient, vec} from '@shopify/react-native-skia';
import {useDerivedValue} from 'react-native-reanimated';

/**
 * انفجار نور شروع صفحه‌ی خانه (فقط المان‌های اسکیا؛ داخل Canvas پس‌زمینه رسم می‌شود
 * تا هیچ TextureView اضافه‌ای ساخته نشود).
 *
 * تایم‌لاین (میلی‌ثانیه از لحظه‌ی شروع ورود):
 *   0    ← درخشش طلایی از مرکز باز می‌شود (اوج ~۱۶۰، محو تا ۱۷۰۰)
 *   40   ← موج حلقه‌ای اول، 220 ← موج دوم
 *   80   ← پرتوهای نور می‌چرخند و باز می‌شوند (محو تا ۲۱۰۰)
 *   40+  ← جرقه‌ها به بیرون پرتاب می‌شوند، کند می‌شوند، کمی می‌افتند و خاموش می‌شوند
 *
 * props: width, height (ناحیه)، clock (SharedValue میلی‌ثانیه از useHomeIntro)
 */

const CENTER_Y = 0.34; // مرکز انفجار نسبت به ارتفاع (پشت کارت‌های ویژه)
const RAY_COUNT = 16;
const SPARK_COUNT = 30;

const clamp01 = x => {
    'worklet';
    return x < 0 ? 0 : x > 1 ? 1 : x;
};

const easeOut = x => {
    'worklet';
    const k = 1 - x;
    return 1 - k * k * k;
};

// پوشش شدت: قبل از a صفر، a→b بالا می‌آید، b→c کامل، c→d نرم محو می‌شود
const envelope = (t, a, b, c, d) => {
    'worklet';
    if (t <= a || t >= d) {
        return 0;
    }
    if (t < b) {
        return easeOut((t - a) / (b - a));
    }
    if (t <= c) {
        return 1;
    }
    const k = (t - c) / (d - c);
    return 1 - k * k * (3 - 2 * k);
};

// ستاره‌ی چهارپر برق‌دار
const starD = (x, y, s) => {
    'worklet';
    return `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;
};

// پرتوهای باریک و پهن یکی‌درمیان، همه از مرکز
const makeRays = (cx, cy, reach) => {
    let d = '';
    for (let i = 0; i < RAY_COUNT; i++) {
        const a = (i / RAY_COUNT) * Math.PI * 2;
        const half = i % 2 === 0 ? 0.075 : 0.035; // رادیان
        d +=
            `M${cx} ${cy}` +
            `L${cx + Math.cos(a - half) * reach} ${cy + Math.sin(a - half) * reach}` +
            `L${cx + Math.cos(a + half) * reach} ${cy + Math.sin(a + half) * reach}Z`;
    }
    return d;
};

const makeSparks = reach =>
    Array.from({length: SPARK_COUNT}, (_, i) => {
        const angle = (i / SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.35;
        return {
            dx: Math.cos(angle),
            dy: Math.sin(angle),
            dist: reach * (0.16 + Math.random() * 0.3), // مسافت پرتاب
            size: 2.5 + Math.random() * 5,
            delay: 40 + Math.random() * 260,
            life: 900 + Math.random() * 700,
            fall: 30 + Math.random() * 70, // افت ملایم در پایان عمر (جاذبه)
            phase: Math.random() * Math.PI * 2,
        };
    });

/* یک موج حلقه‌ای: باز می‌شود، نازک و محو می‌شود (دو خط روی هم به‌جای blur، برای سبکی) */
const Shockwave = ({clock, cx, cy, reach, delay, duration, thickness, color}) => {
    const u = useDerivedValue(() => clamp01((clock.value - delay) / duration));
    const r = useDerivedValue(() => 10 + easeOut(u.value) * reach * 0.6);
    const haloWidth = useDerivedValue(() => thickness * 3 * (1 - u.value) + 2);
    const coreWidth = useDerivedValue(() => thickness * (1 - u.value) + 0.5);
    const opacity = useDerivedValue(() => (u.value <= 0 || u.value >= 1 ? 0 : Math.pow(1 - u.value, 1.4)));

    return (
        <Group opacity={opacity}>
            <Circle cx={cx} cy={cy} r={r} style="stroke" strokeWidth={haloWidth} color={color} opacity={0.25} />
            <Circle cx={cx} cy={cy} r={r} style="stroke" strokeWidth={coreWidth} color={color} />
        </Group>
    );
};

const IntroBurst = memo(function IntroBurst({width: w, height: h, clock}) {
    const cx = w / 2;
    const cy = h * CENTER_Y;
    const reach = Math.hypot(w, h);
    const glowR = w * 0.8;

    const center = useMemo(() => vec(cx, cy), [cx, cy]);
    const rays = useMemo(() => makeRays(cx, cy, reach), [cx, cy, reach]);
    const sparks = useMemo(() => makeSparks(reach), [reach]);

    // درخشش مرکزی
    const glowOpacity = useDerivedValue(() => envelope(clock.value, 0, 160, 450, 1700));
    const glowTransform = useDerivedValue(() => [{scale: 0.3 + 0.8 * easeOut(clamp01(clock.value / 900))}]);

    // پرتوها: آرام می‌چرخند (حدود ۳۰ درجه در کل) و باز می‌شوند
    const raysOpacity = useDerivedValue(() => envelope(clock.value, 80, 450, 950, 2100));
    const raysTransform = useDerivedValue(() => {
        const t = clock.value;
        return [{rotate: t * 0.00025}, {scale: 0.5 + 0.5 * easeOut(clamp01(t / 1200))}];
    });

    // جرقه‌ها: یک مسیر برای همه (یک رسم در هر فریم)
    const sparkPath = useDerivedValue(() => {
        const t = clock.value;
        let d = '';
        for (let i = 0; i < sparks.length; i++) {
            const s = sparks[i];
            const u = (t - s.delay) / s.life;
            if (u <= 0 || u >= 1) {
                continue;
            }
            const travel = s.dist * easeOut(u);
            const x = cx + s.dx * travel;
            const y = cy + s.dy * travel + u * u * s.fall;
            const twinkle = 0.7 + 0.3 * Math.sin(t / 55 + s.phase);
            d += starD(x, y, s.size * Math.pow(1 - u, 0.7) * twinkle);
        }
        return d || 'M0 0'; // مسیر خالی مجاز نیست
    });

    return (
        <Group>
            <Group origin={center} transform={raysTransform} opacity={raysOpacity}>
                <Path path={rays}>
                    <RadialGradient
                        c={center}
                        r={reach * 0.55}
                        colors={['rgba(255,230,160,0.55)', 'rgba(255,214,102,0.16)', 'rgba(255,214,102,0)']}
                        positions={[0, 0.4, 1]}
                    />
                </Path>
            </Group>

            <Group origin={center} transform={glowTransform} opacity={glowOpacity}>
                <Circle c={center} r={glowR}>
                    <RadialGradient
                        c={center}
                        r={glowR}
                        colors={['rgba(255,248,222,0.9)', 'rgba(255,214,102,0.42)', 'rgba(240,185,59,0)']}
                        positions={[0, 0.22, 1]}
                    />
                </Circle>
            </Group>

            <Shockwave clock={clock} cx={cx} cy={cy} reach={reach} delay={40} duration={900} thickness={6} color="#FFE29A" />
            <Shockwave clock={clock} cx={cx} cy={cy} reach={reach} delay={220} duration={1100} thickness={3.5} color="#FFF3CF" />

            {/* هاله‌ی طلایی (خط دور) + هسته‌ی روشن */}
            <Path path={sparkPath} style="stroke" strokeWidth={3} strokeJoin="round" color="rgba(255,190,60,0.45)" />
            <Path path={sparkPath} color="#FFF7DC" />
        </Group>
    );
});

export default IntroBurst;
