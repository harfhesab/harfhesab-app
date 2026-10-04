import {
    GAP,
    INFO_H,
    INSET,
    IS_RTL,
    MAX_CONTENT_WIDTH,
    PADDING,
    WIDE_BREAKPOINT,
} from './homeConfig';

/**
 * مختصات «منطقی» (logical): x همیشه از سمت start اندازه‌گیری می‌شود
 * (چپ در LTR، راست در RTL).
 *
 *  - برای ویوهای RN از `start: x` استفاده کنید (خودکار با RTL درست می‌شود).
 *  - برای رسم در Skia (که مختصاتش همیشه فیزیکی و از چپ است) از mirrorX استفاده کنید.
 *
 * نکته: در RN با RTL فعال، استایل‌های left/right جابه‌جا می‌شوند ولی Skia جابه‌جا نمی‌شود.
 * قاب طلایی (Skia) و تصویر/متن (RN) در نسخه‌ی قبل به همین علت از هم جدا افتاده بودند.
 */
export const mirrorX = (x, size, containerWidth) => (IS_RTL ? containerWidth - x - size : x);

/* mode 'row'    : تصویر در سمت start، متن کنار آن (کارت عریض در موبایل)
   mode 'column' : تصویر بالا، متن پایین */
export function getGeometry(w, h, mode) {
    if (mode === 'row') {
        const side = h - INSET * 2;
        return {
            slot: {x: INSET, y: INSET, size: side},
            text: {
                x: INSET * 2 + side,
                y: INSET,
                width: w - side - INSET * 3 - 4,
                height: side,
            },
        };
    }
    const side = w - INSET * 2;
    return {
        slot: {x: INSET, y: INSET, size: side},
        text: {x: INSET + 6, y: INSET + side, width: w - INSET * 2 - 12, height: INFO_H},
    };
}

const getHeight = (w, mode, rowHeight) => (mode === 'row' ? rowHeight : w - INSET + INFO_H);

/* اندازه‌ی کارت‌ها بر اساس عرض پنجره (با تا/باز شدن Fold دوباره محاسبه می‌شود) */
export function getHomeLayout(windowWidth) {
    const isWide = windowWidth >= WIDE_BREAKPOINT;
    const contentWidth = Math.floor(Math.min(windowWidth, MAX_CONTENT_WIDTH) - PADDING * 2);
    const half = Math.floor((contentWidth - GAP) / 2);
    const rowHeight = Math.round(contentWidth / 2.4);
    const spec = (width, mode) => ({width, mode, height: getHeight(width, mode, rowHeight)});

    // کارت ویژه (featured): همیشه تمام‌عرض و حدود ۱۸٪ بلندتر از کارت large معمولی
    // (سقف ۱۷۰ تا روی Fold باز/تبلت بیش‌ازحد غول‌پیکر نشود)
    const featuredHeight = Math.round(Math.min(contentWidth / 2.4, 170) * 1.18);

    return {
        contentWidth,
        large: isWide ? spec(half, 'column') : spec(contentWidth, 'row'),
        small: spec(half, 'column'),
        featured: {width: contentWidth, mode: 'row', height: featuredHeight},
    };
}

/* اندازه‌ی یک کارت: featured فقط برای کارت‌های large معنا دارد */
export const getCardSpec = (layout, item) =>
    item.featured && item.size === 'large' && item.active !== false ? layout.featured : layout[item.size];