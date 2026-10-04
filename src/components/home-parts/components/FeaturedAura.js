import React, {memo, useMemo} from 'react';
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
import {useDerivedValue} from 'react-native-reanimated';
import {BLEED, CARD_R, GOLD} from '../homeConfig';

const star = (x, y, s) =>
    `M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`;

const BAND_W = 90;

/**
 * هاله‌ی جلب‌توجه برای کارت «ویژه» (item.featured === true).
 * روی کارت می‌نشیند و کاملاً بی‌تأثیر بر لمس است (pointerEvents none).
 *
 *  - هاله‌ی طلایی نفس‌کش دور کارت (بیرون از لبه هم می‌تابد؛ کانواس BLEED دارد)
 *  - قاب طلایی پررنگ‌تر از کارت‌های معمولی
 *  - جاروی نور مورب هر ~۳٫۶ ثانیه
 *  - دو جرقه‌ی چشمک‌زن روی قاب تصویر
 *
 * props: width, height (کارت)، slotX/slotY/slotSize (مختصات فیزیکی قاب تصویر)، time (SharedValue ms)
 */
const FeaturedAura = memo(function FeaturedAura({width: w, height: h, slotX, slotY, slotSize, time}) {
    const clip = useMemo(() => rrect(rect(0, 0, w, h), CARD_R, CARD_R), [w, h]);
    const idle = useMemo(() => [{translateX: w + 120}, {skewX: -0.35}], [w]);

    const sparkA = useMemo(() => star(slotX + slotSize - 16, slotY + 16, 6), [slotX, slotY, slotSize]);
    const sparkB = useMemo(() => star(slotX + 16, slotY + slotSize - 18, 4.5), [slotX, slotY, slotSize]);

    // SharedValue فقط به‌صورت «کل prop» به Skia داده می‌شود؛ هر derived کل آرایه را برمی‌گرداند
    const glow = useDerivedValue(() => 0.5 + 0.35 * Math.sin(time.value / 700));
    const sweep = useDerivedValue(() => {
        const p = Math.min((time.value % 3600) / 1200, 1);
        if (p >= 1) {
            return idle;
        }
        return [{translateX: -120 + p * (w + 240)}, {skewX: -0.35}];
    }, [w, idle]);
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
                {/* هاله‌ی نفس‌کش (blur کوچک تا در لبه‌ی BLEED بریده نشود) */}
                <RoundedRect x={0} y={0} width={w} height={h} r={CARD_R} style="stroke" strokeWidth={6} color="#F0B93B" opacity={glow}>
                    <BlurMask blur={4} style="normal" />
                </RoundedRect>

                <Group clip={clip}>
                    {/* جاروی نور */}
                    <Group transform={sweep}>
                        <Rect x={0} y={0} width={BAND_W} height={h}>
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(BAND_W, 0)}
                                colors={['rgba(255,240,190,0)', 'rgba(255,240,190,0.3)', 'rgba(255,240,190,0)']}
                            />
                        </Rect>
                    </Group>

                    {/* جرقه‌ها */}
                    <Path path={sparkA} color="#FFF6D2" opacity={opA} />
                    <Path path={sparkB} color="#FFF6D2" opacity={opB} />
                </Group>

                {/* قاب طلایی پررنگ */}
                <RoundedRect x={1.25} y={1.25} width={w - 2.5} height={h - 2.5} r={CARD_R} style="stroke" strokeWidth={2.5}>
                    <LinearGradient start={vec(0, 0)} end={vec(w, h)} colors={GOLD} />
                </RoundedRect>
            </Group>
        </Canvas>
    );
});

export default FeaturedAura;