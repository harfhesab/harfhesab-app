import {PermissionsAndroid, Platform, Vibration} from 'react-native';

/**
 * لرزش کوتاه برای حس لمسی، با Vibration خود React Native (فقط اندروید).
 *
 * Vibration در اندروید مجوز android.permission.VIBRATE را لازم دارد و اگر در AndroidManifest نباشد
 * برنامه کرش می‌کند. برای همین یک‌بار بررسی می‌شود؛ بدون مجوز لرزش انجام نمی‌شود و در حالت dev
 * یک هشدار در کنسول می‌آید. (مجوز «عادی» است: از کاربر چیزی پرسیده نمی‌شود، ولی بعد از اضافه کردنش
 * باید اپ دوباره build و نصب شود؛ reload جاوااسکریپت کافی نیست.)
 *
 * مدت‌ها عمداً زیر ۳۰ms نیستند: موتور لرزش بیشتر گوشی‌های اقتصادی لرزش کوتاه‌تر را اصلاً حس نمی‌کند.
 * iOS: طول لرزش قابل تنظیم نیست (همیشه ~۴۰۰ms)، پس آنجا خاموش است.
 */
export const HAPTIC_LIFT = 35; // برداشتن کارت
export const HAPTIC_LAND = 25; // رسیدن کارت به جای خود
export const HAPTIC_LOCKED = [0, 30, 70, 30]; // دو تیک: «قفل است»

const VIBRATE = 'android.permission.VIBRATE';

let status = Platform.OS === 'android' ? 'checking' : 'off'; // 'checking' | 'on' | 'off'
let pending = null; // اولین لرزشی که قبل از جواب بررسی مجوز رسید، گم نشود

if (Platform.OS === 'android') {
    PermissionsAndroid.check(VIBRATE).then(
        granted => {
            status = granted ? 'on' : 'off';
            if (!granted && __DEV__) {
                console.warn(
                    '[homeHaptics] مجوز VIBRATE در AndroidManifest نیست؛ لرزش غیرفعال است. ' +
                        '<uses-permission android:name="android.permission.VIBRATE" /> را اضافه و اپ را دوباره build کنید.',
                );
            }
            if (granted && pending !== null) {
                Vibration.vibrate(pending);
            }
            pending = null;
        },
        () => {
            status = 'off';
            pending = null;
        },
    );
}

/** pattern: عدد (میلی‌ثانیه) یا آرایه‌ی [مکث، لرزش، مکث، لرزش، ...] */
export const vibrate = pattern => {
    if (status === 'on') {
        Vibration.vibrate(pattern);
    } else if (status === 'checking') {
        pending = pattern;
    }
};
