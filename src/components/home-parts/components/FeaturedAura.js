import React, {memo, useMemo} from 'react';
import {
    BlurMask,
    Canvas,
    DashPathEffect,
    Group,
    LinearGradient,
    Path,
    Rect,
    RoundedRect,
    rect,
    rrect,
    vec,
} from '@shopify/react-native-skia';
import {useDerivedValue} from 'react-native-reanimated';
import {BLEED, CARD_R} from '../homeConfig';
import {makeCardPalette} from '../cardPalette';

const star = (x, y, s) =>
    `M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`;

const BAND_W = 90;
const SWEEP_ANGLE = 0.38; // رادیان (~۲۲ درجه)
const SWEEP_REACH = 160; // نوار چرخیده باید کامل بیرون از کارت شروع و تمام شود
const COMET_MS = 4200; // یک دور کامل نور دور کارت
const RIM_INSET = 1.25;
const RIM_R = CARD_R - RIM_INSET;

// دنباله‌ی نور: چند تکه‌ی هم‌سر با طول‌های مختلف روی هم، تا دنباله نرم کم‌رنگ شود
// [طول نسبت به محیط، ضخامت، شفافیت]
const TRAIL = [
    [0.3, 1.5, 0.26],
    [0.18, 1.75, 0.4],
    [0.1, 2, 0.5],
    [0.05, 2.25, 0.8],
    [0.022, 2.5, 1],
];

/* یک تکه از دنباله: طول ثابت، سرش همیشه روی head */
const CometSegment = ({w, h, perimeter, head, length, width, color, opacity, blur}) => {
    const len = length * perimeter;
    // الگوی خط‌چین [len روشن، بقیه خاموش]؛ phase طوری که انتهای تکه روی head بیفتد
    const phase = useDerivedValue(() => {
        const v = (len - head.value) % perimeter;
        return v < 0 ? v + perimeter : v;
    });
    return (
        <RoundedRect
            x={RIM_INSET}
            y={RIM_INSET}
            width={w - RIM_INSET * 2}
            height={h - RIM_INSET * 2}
            r={RIM_R}
            style="stroke"
            strokeWidth={width}
            strokeCap="round"
            color={color}
            opacity={opacity}>
            <DashPathEffect intervals={[len, perimeter - len]} phase={phase} />
            {blur ? <BlurMask blur={blur} style="normal" /> : null}
        </RoundedRect>
    );
};

/**
 * جلوه‌ی کارت «ویژه» (item.featured === true)، روی کارت و بی‌تأثیر بر لمس.
 *
 *  - هاله‌ی نرم بیرون کارت، هم‌رنگ خود کارت و نفس‌کش (بدون قاب زرد ضخیم)
 *  - نوری که با سرعت ثابت دور لبه‌ی کارت می‌چرخد، با دنباله‌ی محو
 *  - جاروی نور مورب هر ~۳٫۶ ثانیه
 *  - دو جرقه‌ی چشمک‌زن روی قاب تصویر
 *
 * props: width, height (کارت)، colors (item.colors)، slotX/slotY/slotSize (مختصات فیزیکی قاب تصویر)،
 *        time (SharedValue ms)
 */
const FeaturedAura = memo(function FeaturedAura({width: w, height: h, colors, slotX, slotY, slotSize, time}) {
    const p = useMemo(() => makeCardPalette(colors), [colors]);
    const clip = useMemo(() => rrect(rect(0, 0, w, h), CARD_R, CARD_R), [w, h]);
    const idle = useMemo(() => [{translateX: w + SWEEP_REACH}, {translateY: h / 2}, {rotate: SWEEP_ANGLE}], [w, h]);

    const sparkA = useMemo(() => star(slotX + slotSize - 16, slotY + 16, 6), [slotX, slotY, slotSize]);
    const sparkB = useMemo(() => star(slotX + 16, slotY + slotSize - 18, 4.5), [slotX, slotY, slotSize]);

    // محیط مسیر لبه (مستطیل با گوشه‌ی گرد)
    const rimW = w - RIM_INSET * 2;
    const rimH = h - RIM_INSET * 2;
    const perimeter = 2 * (rimW + rimH) - (8 - 2 * Math.PI) * RIM_R;

    // SharedValue فقط به‌صورت «کل prop» به Skia داده می‌شود؛ هر derived کل مقدار را برمی‌گرداند
    const glow = useDerivedValue(() => 0.55 + 0.3 * Math.sin(time.value / 900));
    const head = useDerivedValue(() => ((time.value % COMET_MS) / COMET_MS) * perimeter);
    // نوار مورب واقعی با rotate (skewX در اسکیا برش عمودی می‌دهد، نه مورب)
    const sweep = useDerivedValue(() => {
        const t = Math.min((time.value % 3600) / 1200, 1);
        if (t >= 1) {
            return idle;
        }
        return [{translateX: -SWEEP_REACH + t * (w + SWEEP_REACH * 2)}, {translateY: h / 2}, {rotate: SWEEP_ANGLE}];
    }, [w, h, idle]);
    const opA = useDerivedValue(() => 0.5 + 0.5 * Math.sin(time.value / 420));
    const opB = useDerivedValue(() => 0.5 + 0.5 * Math.sin(time.value / 420 + 2.4));

    return (
        <Canvas
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: -BLEED,
                top: -BLEED,
                width: w + BLEED * 2,
                height: h + BLEED * 2,
            }}>
            <Group transform={[{translateX: BLEED}, {translateY: BLEED}]}>
                {/* هاله‌ی نرم بیرون کارت: فقط بیرون لبه رسم می‌شود (invertClip) و روی خود کارت نمی‌افتد.
                    (BlurMask با style="outer" روی شکل‌های بزرگ وسط را پر می‌کند، برای همین استفاده نشده) */}
                <Group clip={clip} invertClip>
                    <RoundedRect x={0} y={0} width={w} height={h} r={CARD_R} style="stroke" strokeWidth={7} color={p.rim} opacity={glow}>
                        <BlurMask blur={6} style="normal" />
                    </RoundedRect>
                </Group>

                <Group clip={clip}>
                    {/* جاروی نور: نوار مورب بلند که از روی کل کارت رد می‌شود */}
                    <Group transform={sweep}>
                        <Rect x={-BAND_W / 2} y={-h} width={BAND_W} height={h * 2}>
                            <LinearGradient
                                start={vec(-BAND_W / 2, 0)}
                                end={vec(BAND_W / 2, 0)}
                                colors={['rgba(255,244,214,0)', 'rgba(255,244,214,0.26)', 'rgba(255,244,214,0)']}
                            />
                        </Rect>
                    </Group>

                    {/* جرقه‌ها */}
                    <Path path={sparkA} color="#FFF6D2" opacity={opA} />
                    <Path path={sparkB} color="#FFF6D2" opacity={opB} />
                </Group>

                {/* نور گردان دور لبه: هاله‌ی سر + دنباله */}
                <CometSegment w={w} h={h} perimeter={perimeter} head={head} length={0.08} width={9} color={p.rim} opacity={0.9} blur={5} />
                {TRAIL.map(([length, width, opacity]) => (
                    <CometSegment
                        key={length}
                        w={w}
                        h={h}
                        perimeter={perimeter}
                        head={head}
                        length={length}
                        width={width}
                        color="#FFFFFF"
                        opacity={opacity}
                    />
                ))}
            </Group>
        </Canvas>
    );
});

export default FeaturedAura;
