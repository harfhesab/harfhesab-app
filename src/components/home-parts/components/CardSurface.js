import React, {memo, useMemo} from 'react';
import {
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
import {CARD_R, SLOT_R} from '../homeConfig';
import {makeCardPalette} from '../cardPalette';
import {ChipBackground} from './CardTags';

/* ═════════════ نقش کاشی ═════════════ */
const TILE = 34; // فاصله‌ی ستاره‌ها (dp)
const STAR_R = TILE * 0.3; // شعاع نوک ستاره
const STAR_IN = STAR_R * 0.62; // شعاع گودی بین نوک‌ها

// ستاره‌های هشت‌پر (خاتم) روی شبکه‌ی لوزی، با یک لوزی کوچک بین هر چهار ستاره
const makeLattice = (w, h) => {
    let d = '';
    const half = TILE / 2;
    for (let row = -1; row * half < h + TILE; row++) {
        const y = row * half;
        const offset = row % 2 === 0 ? 0 : half;
        for (let x = -TILE + offset; x < w + TILE; x += TILE) {
            for (let k = 0; k < 16; k++) {
                const a = (k * Math.PI) / 8 - Math.PI / 2;
                const r = k % 2 === 0 ? STAR_R : STAR_IN;
                d += `${k === 0 ? 'M' : 'L'}${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`;
            }
            d += 'Z';
            // لوزی کوچک در فاصله‌ی افقی دو ستاره
            const dx = x + half;
            const s = TILE * 0.09;
            d += `M${dx} ${(y - s).toFixed(1)}L${(dx + s).toFixed(1)} ${y}L${dx} ${(y + s).toFixed(1)}L${(dx - s).toFixed(1)} ${y}Z`;
        }
    }
    return d;
};

/* ═════════════ گوشه‌های تزئینی (مثل کارت‌های بازی نفیس) ═════════════ */
const ORN_INSET = 6.5; // فاصله از لبه‌ی کارت
const ORN_ARM = 16; // طول بازوی صاف هر گوشه

// یک گوشه: کمان هم‌مرکز با گوشه‌ی کارت + دو بازوی صاف + لوزی کوچک وسط کمان.
// fx/fy = جهت گوشه (۱ = چپ/بالا، -۱ = راست/پایین)؛ ox/oy = مختصات خود گوشه
const cornerPath = (ox, oy, fx, fy) => {
    const r = CARD_R - ORN_INSET;
    const P = (x, y) => `${(ox + fx * x).toFixed(1)} ${(oy + fy * y).toFixed(1)}`;
    const sweep = fx * fy > 0 ? 1 : 0;
    const m = CARD_R - r * Math.SQRT1_2; // نقطه‌ی وسط کمان
    const s = 2.6;
    return (
        `M${P(ORN_INSET, CARD_R + ORN_ARM)}L${P(ORN_INSET, CARD_R)}` +
        `A${r} ${r} 0 0 ${sweep} ${P(CARD_R, ORN_INSET)}L${P(CARD_R + ORN_ARM, ORN_INSET)}` +
        `M${P(m, m - s)}L${P(m + s, m)}L${P(m, m + s)}L${P(m - s, m)}Z`
    );
};

/* ═════════════ شمسه (ترنج خورشیدی) ═════════════ */
const LOBES = 16;

// گل شانزده‌پر با گلبرگ‌های گرد + ستاره‌ی هشت‌پر و دایره‌ی داخلی
const makeShamseh = (cx, cy, R) => {
    const inner = R * 0.8;
    let d = '';
    for (let k = 0; k <= LOBES; k++) {
        const a = (k / LOBES) * Math.PI * 2 - Math.PI / 2;
        const x = cx + inner * Math.cos(a);
        const y = cy + inner * Math.sin(a);
        if (k === 0) {
            d += `M${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
            const m = a - Math.PI / LOBES; // نوک گلبرگ بین دو گودی
            const qx = cx + R * 1.12 * Math.cos(m);
            const qy = cy + R * 1.12 * Math.sin(m);
            d += `Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
    }
    d += 'Z';
    const s1 = R * 0.62;
    const s2 = s1 * 0.6;
    for (let k = 0; k < 16; k++) {
        const a = (k * Math.PI) / 8 - Math.PI / 2;
        const r = k % 2 === 0 ? s1 : s2;
        d += `${k === 0 ? 'M' : 'L'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    }
    d += 'Z';
    const c = R * 0.28;
    d += `M${cx + c} ${cy}A${c} ${c} 0 1 0 ${cx - c} ${cy}A${c} ${c} 0 1 0 ${cx + c} ${cy}Z`;
    return d;
};

/**
 * بدنه‌ی ثابت کارت (فقط المان‌های اسکیا؛ داخل Canvas کارت رسم می‌شود و هرگز تکان نمی‌خورد).
 *
 * لایه‌ها از پایین به بالا:
 *   مینای سه‌رنگ ← نور پشت تصویر ← نقش کاشی خاتم ← سایه‌ی رنگی لبه‌ها ← صفحه‌ی متن
 *   ← براقی شیشه‌ای ← لبه‌ی مینایی (خط تیره‌ی بیرون + برق داخلی) ← قاب طلایی تصویر
 *
 * همه‌ی مختصات فیزیکی‌اند (از چپ)؛ آینه کردن برای RTL را GameCard انجام می‌دهد.
 *
 * props:
 *   width, height, mode ('row' | 'column'), colors (item.colors)
 *   slotX, slotY, slotSize  : قاب تصویر
 *   textY                   : شروع ناحیه‌ی متن در حالت ستونی
 *   medallionX              : مرکز افقی ناحیه‌ی متن (جای شمسه)
 *   hasBadge                : کارت badge دارد (گوشه‌ی تزئینی زیر آن رسم نمی‌شود)
 *   chips                   : (اختیاری) [{x, y, w, h}] پس‌زمینه‌ی چیپ‌های تگ در مختصات کارت؛ آخر از همه رسم
 *                             می‌شوند (همان ترتیب قبلی که هر چیپ کانواس جدای خودش را روی کارت داشت)
 *
 * سایه‌ی زیر کارت بیرون از لبه رسم می‌شود؛ Canvas والد باید دست‌کم SURFACE_BLEED حاشیه داشته باشد.
 */
export const SURFACE_BLEED = 24;

const CardSurface = memo(function CardSurface({
    width: w,
    height: h,
    mode,
    colors,
    slotX,
    slotY,
    slotSize,
    textY,
    medallionX,
    hasBadge,
    chips,
}) {
    const p = useMemo(() => makeCardPalette(colors), [colors]);
    const clip = useMemo(() => rrect(rect(0, 0, w, h), CARD_R, CARD_R), [w, h]);
    const lattice = useMemo(() => makeLattice(w, h), [w, h]);

    const slotCx = slotX + slotSize / 2;
    const slotCy = slotY + slotSize / 2;
    const isRow = mode === 'row';

    // شمسه پشت متن: در حالت ردیفی وسط ستون متن، در حالت ستونی وسط نوار پایین
    const shamseh = useMemo(
        () =>
            isRow
                ? makeShamseh(medallionX, h * 0.55, h * 0.6)
                : makeShamseh(w / 2, textY + (h - textY) / 2, (h - textY) * 0.62),
        [isRow, medallionX, w, h, textY],
    );

    // گوشه‌های تزئینی فقط روی گوشه‌هایی که تصویر آن‌ها را نپوشانده؛ گوشه‌ی بالای سمت متن
    // جای badge است (در حالت ردیفی) و اگر badge باشد خالی می‌ماند
    const ornaments = useMemo(() => {
        if (!isRow) {
            return cornerPath(0, h, 1, -1) + cornerPath(w, h, -1, -1);
        }
        const artRight = slotCx > w / 2;
        const top = artRight ? cornerPath(0, 0, 1, 1) : cornerPath(w, 0, -1, 1);
        const bottom = artRight ? cornerPath(0, h, 1, -1) : cornerPath(w, h, -1, -1);
        return (hasBadge ? '' : top) + bottom;
    }, [isRow, slotCx, w, h, hasBadge]);

    // براقی شیشه‌ای: نوار بالا با لبه‌ی پایینی خمیده (تا لبه کاملاً محو می‌شود)
    const gloss = `M0 0H${w}V${h * 0.3}Q${w * 0.5} ${h * 0.46} 0 ${h * 0.36}Z`;

    const frameX = slotX - 3.5;
    const frameY = slotY - 3.5;
    const frameS = slotSize + 7;

    return (
        <Group>
            {/* سایه‌ی نرم زیر کارت (بیرون از لبه؛ اندازه طوری است که کامل داخل SURFACE_BLEED جا شود) */}
            <RoundedRect x={0} y={0} width={w} height={h} r={CARD_R} color="black">
                <Shadow dx={0} dy={6} blur={6} color={p.drop} shadowOnly />
            </RoundedRect>

            <Group clip={clip}>
                {/* مینای سه‌رنگ */}
                <Rect x={0} y={0} width={w} height={h}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(w, h)}
                        colors={[p.bodyTop, p.bodyMid, p.bodyDeep]}
                        positions={[0, 0.45, 1]}
                    />
                </Rect>

                {/* نور گرم پشت تصویر */}
                <Rect x={0} y={0} width={w} height={h}>
                    <RadialGradient c={vec(slotCx, slotCy)} r={slotSize * 1.05} colors={[p.backlight, p.backlightClear]} />
                </Rect>

                {/* نقش کاشی خاتم، کم‌رنگ */}
                <Path path={lattice} style="stroke" strokeWidth={1}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(0, h)}
                        colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.045)']}
                    />
                </Path>

                {/* شمسه‌ی محو پشت متن */}
                <Path path={shamseh} style="stroke" strokeWidth={1.2} color="rgba(255,255,255,0.1)" />

                {/* سایه‌ی رنگی لبه‌ها (عمق) */}
                <Rect x={0} y={0} width={w} height={h}>
                    <RadialGradient
                        c={vec(w / 2, h / 2)}
                        r={Math.hypot(w, h) / 2}
                        colors={[p.shadeClear, p.shade]}
                        positions={[0.5, 1]}
                    />
                </Rect>

                {/* صفحه‌ی متن: ستونی = نوار پایین با تیرگی تدریجی و خط تزئینی */}
                {isRow ? null : (
                    <Group>
                        <Rect x={0} y={textY - 14} width={w} height={h - textY + 14}>
                            <LinearGradient
                                start={vec(0, textY - 14)}
                                end={vec(0, h)}
                                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.32)', 'rgba(0,0,0,0.42)']}
                                positions={[0, 0.25, 1]}
                            />
                        </Rect>
                    </Group>
                )}

                {/* براقی شیشه‌ای */}
                <Path path={gloss}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(0, h * 0.34)}
                        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
                    />
                </Path>

                {/* درخشش نرم از گوشه‌ی بالا (نور صحنه) */}
                <Rect x={0} y={0} width={w} height={h}>
                    <RadialGradient
                        c={vec(w * 0.12, -h * 0.25)}
                        r={Math.max(w, h) * 0.75}
                        colors={['rgba(255,250,235,0.11)', 'rgba(255,250,235,0)']}
                    />
                </Rect>

                {/* سایه‌ی تصویر */}
                <RoundedRect x={slotX} y={slotY} width={slotSize} height={slotSize} r={SLOT_R} color="black">
                    <Shadow dx={0} dy={6} blur={10} color="rgba(0,0,0,0.6)" shadowOnly />
                </RoundedRect>
            </Group>

            {/* لبه‌ی مینایی: خط تیره‌ی بیرونی + برق شیشه‌ای داخلی */}
            <RoundedRect x={0.5} y={0.5} width={w - 1} height={h - 1} r={CARD_R} style="stroke" strokeWidth={1} color="rgba(0,0,0,0.55)" />
            <RoundedRect x={1.75} y={1.75} width={w - 3.5} height={h - 3.5} r={CARD_R - 1.5} style="stroke" strokeWidth={1.5}>
                <LinearGradient
                    start={vec(0, 0)}
                    end={vec(0, h)}
                    colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.2)']}
                    positions={[0, 0.6, 1]}
                />
            </RoundedRect>

            {/* گوشه‌های تزئینی طلایی */}
            <Path path={ornaments} style="stroke" strokeWidth={1.3} strokeCap="round" strokeJoin="round" opacity={0.75}>
                <LinearGradient start={vec(0, 0)} end={vec(w, h)} colors={['#FFF1B8', '#E2A93A', '#FFE08A']} />
            </Path>

            {/* قاب طلایی تصویر: برق بیرونی ← طلای فلزی ← خط تیره‌ی جداکننده */}
            <RoundedRect
                x={frameX - 2}
                y={frameY - 2}
                width={frameS + 4}
                height={frameS + 4}
                r={SLOT_R + 5.5}
                style="stroke"
                strokeWidth={1}
                color="rgba(255,240,200,0.45)"
            />
            <RoundedRect x={frameX} y={frameY} width={frameS} height={frameS} r={SLOT_R + 3.5} style="stroke" strokeWidth={3}>
                <LinearGradient
                    start={vec(frameX, frameY)}
                    end={vec(frameX + frameS, frameY + frameS)}
                    colors={['#FFF1B8', '#F0B93B', '#A8710F', '#F7CB57', '#8C5A08']}
                    positions={[0, 0.3, 0.55, 0.8, 1]}
                />
            </RoundedRect>
            <RoundedRect
                x={slotX - 0.75}
                y={slotY - 0.75}
                width={slotSize + 1.5}
                height={slotSize + 1.5}
                r={SLOT_R + 0.75}
                style="stroke"
                strokeWidth={1.5}
                color="rgba(0,0,0,0.6)"
            />

            {/* پس‌زمینه‌ی چیپ‌های تگ (به‌جای یک TextureView جدا برای هر چیپ) */}
            {chips
                ? chips.map((c, i) => (
                      <Group key={i} transform={[{translateX: c.x}, {translateY: c.y}]}>
                          <ChipBackground w={c.w} h={c.h} />
                      </Group>
                  ))
                : null}
        </Group>
    );
});

export default CardSurface;
