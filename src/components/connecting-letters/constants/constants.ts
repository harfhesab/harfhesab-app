import { Dimensions } from 'react-native';

// هر چیزی که «حس» بازی را تغییر می‌دهد اینجاست، تا بدون دست زدن به منطق قابل تنظیم باشد.

// ─── انتخاب و بازخورد ───────────────────────────────────────────────────
/** زمانی (ms) که بازیکن برای انتخاب حرف بعدی دارد، پیش از آن‌که کلمه ثبت شود. */
export const CARD_SELECTION_DURATION = 2500;
/** مدتی که نتیجه (درست / غلط / تکراری) پیش از محو شدن روی صفحه می‌ماند. */
export const FEEDBACK_HOLD_MS = 2500;
export const FEEDBACK_FADE_MS = 1500;
/** شعاع لمس اضافه (px) دور هر کارت متحرک، تا کارت‌های سریع هم راحت لمس شوند. */
export const TOUCH_SLOP = 6;
/**
 * وقتی حروف انتخاب‌شده یک کلمه‌ی معما را کامل کنند و آن کلمه پیشوندِ کلمه‌ی بلندتری در معما نباشد،
 * بدون انتظار برای تایمر همان لحظه ثبت می‌شود. برای رفتار قبلی (همیشه منتظر تایمر) false کنید.
 */
export const SUBMIT_COMPLETE_WORDS_INSTANTLY = false;
/** نشستن کلمه در خانه‌ها: مدت انیمیشن هر خانه، و فاصله‌ی شروع خانه‌ی بعدی (کسری از همین مدت). */
export const REVEAL_BOX_MS = 240;
export const REVEAL_STAGGER = 0.25;
/** پرشِ حرفی که با راهنما آشکار می‌شود؛ خود حرف همان فریم اول کامل دیده می‌شود. */
export const HINT_POP_MS = 260;

// ─── چیدمان صفحه‌ی بازی ───────────────────────────────────────────────────────────
export const BOARD_SIDE_MARGIN = 24;
export const BOARD_BOTTOM_MARGIN = 20;
export const BOARD_MAX_WIDTH = 640;
/** صفحه‌ی بازی هرگز بیش از این کسر از ارتفاع پنجره را نمی‌گیرد. */
export const BOARD_MAX_HEIGHT_RATIO = 0.42;
/** فاصله‌ی داخلی بین قاب صفحه و محدوده‌ای که کارت‌ها در آن حرکت می‌کنند. */
export const BOARD_PADDING = 3;
export const BOARD_RADIUS = 22;
export const TILE_MAX_SIZE = 60;
export const TILE_WIDTH_DIVISOR = 5.3;
/** سقف سهمی از محدوده که کارت‌ها می‌پوشانند (تا معماهای پرحرف هم قابل بازی بمانند). */
export const TILE_MAX_COVERAGE = 0.3;

// ─── فیزیک ────────────────────────────────────────────────────────────────
// سرعت‌ها بر حسب px/s هستند. برای کندتر کردن بازی هر دو را کم کنید و نسبتشان را حفظ کنید.
export const MIN_VELOCITY = 35;
export const MAX_VELOCITY = 90;
/** کمتر از 1، تا کارت‌هایی که در گوشه گیر کرده‌اند انرژی از دست بدهند و به‌جای لرزیدن آرام جدا شوند. */
export const COLLISION_RESTITUTION = 0.92;
/** سرعتی (1/s) که یک سرعتِ خارج از بازه با آن به [MIN_VELOCITY, MAX_VELOCITY] برمی‌گردد. */
export const SPEED_RELAX_RATE = 2.5;
/**
 * بیشترین فاصله‌ی زمانی بین دو فریم که شبیه‌سازی می‌پذیرد. برگشت از background یا افت شدید فریم
 * می‌تواند صدها میلی‌ثانیه گزارش کند؛ بدون این سقف کارت‌ها از میان هم «تله‌پورت» می‌کردند.
 */
export const PHYSICS_MAX_DELTA_MS = 48;
/** مقیاس کارت تا وقتی جزء کلمه‌ی در حال ساخت است. */
export const PICKED_SCALE = 0.3;
/** فنرِ مقیاس: کمی کم‌میرا برای یک جهش سرزنده. */
export const SCALE_SPRING_STIFFNESS = 260;
export const SCALE_SPRING_DAMPING = 18;
export const PULSE_SECONDS = 0.45;

// ─── خروجی‌های قدیمی ─────────────────────────────────────────────────────────
// نگه داشته شده‌اند تا کدهای بیرون از این پوشه که آن‌ها را import کرده‌اند همچنان کامپایل شوند.
// خود بازی ابعادش را از اندازه‌ی زنده‌ی پنجره حساب می‌کند (`engine/metrics.ts`).
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('screen');
export const BOUNDARY_HORIZONTAL_OFFSET = BOARD_SIDE_MARGIN;
export const BOUNDARY_BOTTOM_OFFSET = BOARD_BOTTOM_MARGIN;
export const BOUNDARY_WIDTH = Math.min(WINDOW_WIDTH - BOARD_SIDE_MARGIN * 2, BOARD_MAX_WIDTH);
export const BOUNDARY_HEIGHT = Math.min(BOUNDARY_WIDTH, WINDOW_HEIGHT * BOARD_MAX_HEIGHT_RATIO);
export const BOUNDARY_BORDER_RADIUS = BOARD_RADIUS;
export const BOUNDARY_BORDER_WIDTH = 2;
export const BOUNDARY_TOP_OFFSET = WINDOW_HEIGHT - BOUNDARY_HEIGHT + BOUNDARY_BOTTOM_OFFSET;
export const BOUNDARY_X = 0;
export const BOUNDARY_Y = 0;
export const CARD_SIZE_FLOATING = Math.min(TILE_MAX_SIZE, BOUNDARY_WIDTH / TILE_WIDTH_DIVISOR);
export const FONT_SIZE_FLOATING = CARD_SIZE_FLOATING / 1.55;
export const CARD_BORDER_RADIUS = 15;
export const CARD_SIZE_SELECTED = CARD_SIZE_FLOATING * PICKED_SCALE;
export const FONT_SIZE_SELECTED = FONT_SIZE_FLOATING * PICKED_SCALE;
export const CARD_ZINDEX_SELECTED = 1;
export const CARD_ZINDEX_NORMAL = 100;
