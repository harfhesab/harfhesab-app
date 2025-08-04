import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const BOUNDARY_HORIZONTAL_OFFSET = 40;
export const BOUNDARY_BOTTOM_OFFSET = 20;
export const BOUNDARY_WIDTH = width - (BOUNDARY_HORIZONTAL_OFFSET * 2);
const BOUNDARY_HEIGHT_CALCULATION = width - (BOUNDARY_HORIZONTAL_OFFSET * 2);
export const BOUNDARY_HEIGHT = BOUNDARY_HEIGHT_CALCULATION > 450 ? height*0.4 : BOUNDARY_HEIGHT_CALCULATION;
export const BOUNDARY_BORDER_RADIUS = 10;
export const BOUNDARY_BORDER_WIDTH = 2;
export const BOUNDARY_TOP_OFFSET = height - BOUNDARY_HEIGHT + BOUNDARY_BOTTOM_OFFSET;

const CARD_SIZE_FLOATING_CALCULATION = (width - (BOUNDARY_HORIZONTAL_OFFSET * 2)) / 6;
export const CARD_SIZE_FLOATING = CARD_SIZE_FLOATING_CALCULATION > 80 ? 80 : CARD_SIZE_FLOATING_CALCULATION;
export const CARD_SIZE_DRAGGING = CARD_SIZE_FLOATING + 30;
export const CARD_SIZE_ATTACHED = CARD_SIZE_FLOATING + 30;
export const BOUNDARY_X = 0;
export const BOUNDARY_Y = 0;
export const FONT_SIZE_FLOATING = CARD_SIZE_FLOATING / 1.65;
export const FONT_SIZE_DRAGGING = CARD_SIZE_DRAGGING / 1.65;
export const FONT_SIZE_ATTACHED = CARD_SIZE_ATTACHED / 1.65;
export const MAX_VELOCITY = 100;
export const MIN_VELOCITY = 40;
export const CARD_BORDER_RADIUS = 10;
export const MAGNET_OVERLAP_THRESHOLD = 0.5; // حداقل 50% همپوشانی
export const MAGNET_DELAY = 250; // تأخیر 250 میلی‌ثانیه برای چسبیدن کارت
export const ATTACH_OFFSET_X = 2; // اختلاف 3 پیکسل در محور x
export const ATTACH_OFFSET_Y = 2; // اختلاف 3 پیکسل در محور y
export const SPRING_CONFIG_MAGNET = { stiffness: 200, damping: 16, mass: 1.4, overshootClamping: false };
export const MAX_CARDS = 10; // حداکثر تعداد کارت‌ها برای محاسبه zIndex
export const ZINDEX_BASE_ATTACHED = 1000; // zIndex پایه برای کارت‌های چسبیده
export const ZINDEX_BASE_FLOATING = 500; // zIndex پایه برای کارت‌های معلق
export const ZINDEX_DRAGGING = 2000; // zIndex برای کارت درگ‌شده
export const FOLLOW_DELAY = 25; // تأخیر (میلی‌ثانیه) برای حرکت دنباله‌دار هر کارت
export const WORD_DISPLAY_DURATION = 1500; // مدت‌زمان نمایش کلمه پس از دراپ (1.5 ثانیه)