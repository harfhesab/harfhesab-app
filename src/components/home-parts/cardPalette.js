/**
 * رنگ‌های مشتق از دو رنگ اصلی کارت (item.colors) برای لایه‌های تزئینی.
 * همه‌چیز یک‌بار و در JS محاسبه می‌شود (useMemo)، نه در هر فریم.
 */

const parseHex = hex => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6);
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mixRgb = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

const rgba = ([r, g, b], a = 1) => `rgba(${r},${g},${b},${a})`;

const WHITE = [255, 255, 255];
const WARM = [255, 242, 196]; // نور گرم طلایی
const BLACK = [0, 0, 0];

/** @param colors [رنگ روشن‌تر، رنگ تیره‌تر] مثل item.colors */
export function makeCardPalette(colors) {
    const c0 = parseHex(colors[0]);
    const c1 = parseHex(colors[1] || colors[0]);
    return {
        // بدنه‌ی مینایی: سه توقف، بالای start روشن‌تر، پایین end عمیق‌تر
        bodyTop: rgba(mixRgb(c0, WHITE, 0.1)),
        bodyMid: rgba(c0),
        bodyDeep: rgba(mixRgb(c1, BLACK, 0.12)),
        // نور پشت تصویر
        backlight: rgba(mixRgb(c0, WARM, 0.55), 0.6),
        backlightClear: rgba(mixRgb(c0, WARM, 0.55), 0),
        // هاله و نور دور کارت ویژه (هم‌رنگ خود کارت، نه زرد)
        rim: rgba(mixRgb(c0, WHITE, 0.55)),
        // سایه‌ی زیر کارت روی پس‌زمینه
        drop: rgba(mixRgb(c1, BLACK, 0.7), 0.6),
        // سایه‌ی رنگی (به‌جای سیاه خالص، عمق طبیعی‌تر)
        shade: rgba(mixRgb(c1, BLACK, 0.55), 0.55),
        shadeClear: rgba(mixRgb(c1, BLACK, 0.55), 0),
    };
}
