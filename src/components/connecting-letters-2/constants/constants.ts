import { Dimensions } from 'react-native';

const {width, height} = Dimensions.get("screen");

export const BOUNDARY_HORIZONTAL_OFFSET = 40;
export const BOUNDARY_BOTTOM_OFFSET = 20;
export const BOUNDARY_WIDTH = width - (BOUNDARY_HORIZONTAL_OFFSET * 2);
const BOUNDARY_HEIGHT_CALCULATION = width - (BOUNDARY_HORIZONTAL_OFFSET * 2);
export const BOUNDARY_HEIGHT = BOUNDARY_HEIGHT_CALCULATION > 450 ? height*0.4 : BOUNDARY_HEIGHT_CALCULATION;
export const BOUNDARY_BORDER_RADIUS = 10;
export const BOUNDARY_BORDER_WIDTH = 2;
export const BOUNDARY_TOP_OFFSET = height - BOUNDARY_HEIGHT + BOUNDARY_BOTTOM_OFFSET;

const CARD_SIZE_FLOATING_CALCULATION = (width - (BOUNDARY_HORIZONTAL_OFFSET * 2)) / 5.3;
export const CARD_SIZE_FLOATING = CARD_SIZE_FLOATING_CALCULATION > 55 ? 55 : CARD_SIZE_FLOATING_CALCULATION;
export const BOUNDARY_X = 0;
export const BOUNDARY_Y = 0;
export const FONT_SIZE_FLOATING = CARD_SIZE_FLOATING / 1.55;
export const CARD_BORDER_RADIUS = 15;
// این دو مقدار مستقیماً سرعت حرکت کارت‌ها را کنترل می‌کنند (px/s).
// برای کند کردن حرکت، هر دو را کم کن (نسبتشان را تقریباً حفظ کن تا رفتار طبیعی بماند).
export const MAX_VELOCITY = 90;
export const MIN_VELOCITY = 35;

// ضریب بازگشت برخورد (Restitution). عدد ۱ یعنی برخورد کاملاً الاستیک و بدون افت انرژی
// (دقیقاً مثل قبل) که باعث می‌شود کارت‌هایی که در گوشه یا بین چند کارت دیگر گیر می‌کنند
// دائماً با همان انرژی برگردند و یک لرزش ریز و پیوسته ایجاد کنند. با کمی کمتر از ۱،
// هر برخورد کمی انرژی از دست می‌دهد و کارت‌های گیرکرده به‌جای لرزیدن، آرام باز می‌شوند.
export const COLLISION_RESTITUTION = 0.94;

// حداکثر dt (میلی‌ثانیه) که موتور فیزیک در یک فریم می‌پذیرد.
// وقتی اپ از background برمی‌گردد یا یک فریم دراپ سنگین رخ می‌دهد، timeSincePreviousFrame
// می‌تواند خیلی بزرگ شود (چند صد میلی‌ثانیه یا بیشتر). بدون این کلمپ، کارت‌ها در یک فریم
// می‌توانند مسافت زیادی را "تله‌پورت" کنند یا حتی از دیواره‌ها عبور کنند.
export const PHYSICS_MAX_DELTA_MS = 48; // معادل تقریبی ۳ فریم در ۶۰fps

export const CARD_SELECTION_DURATION = 2500;
export const CARD_SIZE_SELECTED = CARD_SIZE_FLOATING / 4;
export const FONT_SIZE_SELECTED = FONT_SIZE_FLOATING / 4;
export const CARD_ZINDEX_SELECTED = 1;
export const CARD_ZINDEX_NORMAL = 100;