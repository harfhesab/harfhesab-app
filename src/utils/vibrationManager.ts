import { Vibration, Platform } from 'react-native';

type VibrationPattern = number | number[]; // عدد ساده یا آرایه زمان‌ها

interface VibrationOptions {
  pattern?: VibrationPattern;
  repeat?: boolean;
  enabled?: boolean; // به‌صورت دستی امکان غیرفعال‌سازی ویبره
}

// وضعیت پیش‌فرض ویبره فعال است
let isVibrationEnabled = true;

// تابع برای فعال یا غیرفعال کردن ویبره از بیرون (مثلاً از تنظیمات بازی)
export const setVibrationEnabled = (enabled: boolean) => {
  isVibrationEnabled = enabled;
};

// تابع اصلی ویبره
export const vibrate = (options?: VibrationOptions) => {
  if (!isVibrationEnabled) return;

  const pattern = options?.pattern ?? 80; // پیش‌فرض 80 میلی‌ثانیه
  const repeat = options?.repeat ?? false;

  // فقط روی Android تکرار پشتیبانی می‌شه
  if (Array.isArray(pattern)) {
    Vibration.vibrate(pattern, Platform.OS === 'android' && repeat);
  } else {
    Vibration.vibrate(pattern);
  }
};

// تابع توقف ویبره (برای حالت repeat)
export const cancelVibration = () => {
  Vibration.cancel();
};
