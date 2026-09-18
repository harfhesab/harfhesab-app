import { navigationRef } from '../main/navigationService';
import { store } from '../redux/store/Store';

let pendingKilledStateNotificationData = null;

function isUserCurrentlyLoggedIn() {
    const state = store.getState();
    return Boolean(state?.account?.isLoggedIn && state?.account?.token);
}

/**
 * ناوبری فوری بر اساس داده‌ی نوتیف. اگر کاربر لاگین نباشد، هیچ ناوبری‌ای انجام نمی‌شود.
 */
export function navigateFromNotificationData(data) {
    if (!data?.screen) {
        return;
    }
    if (!isUserCurrentlyLoggedIn()) {
        return;
    }
    if (navigationRef.isReady()) {
        navigationRef.navigate(data.screen, { _id: data.item_id });
    }
}

export function queueNotificationDataForAfterSplash(data) {
    if (data?.screen) {
        pendingKilledStateNotificationData = data;
    }
}

/**
 * باید دقیقاً وقتی Splash تصمیم می‌گیرد اپ اصلی را نشان دهد صدا زده شود.
 * چک لاگین بودن داخل خودِ navigateFromNotificationData هم انجام می‌شود،
 * اما این‌جا صرفاً برای پاک‌سازی صف کافی است این تابع را صدا بزنید.
 */
export function flushNotificationDataAfterSplash() {
    if (!pendingKilledStateNotificationData) {
        return;
    }
    const data = pendingKilledStateNotificationData;
    pendingKilledStateNotificationData = null;
    navigateFromNotificationData(data);
}