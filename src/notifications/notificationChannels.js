import notifee, { AndroidImportance } from 'react-native-notify-kit';

// شناسه‌ی هر ۴ Channel، دقیقاً منطبق با channelId که بک‌اند در پیام FCM می‌فرستد
export const NOTIFICATION_CHANNEL_IDS = Object.freeze({
    SOUND_VIBRATE: 'sound_vibrate',
    SOUND_ONLY: 'sound_only',
    SILENT_VIBRATE: 'silent_vibrate',
    SILENT: 'silent',
});

export async function createNotificationChannels() {
    try {
        await Promise.all([
            notifee.createChannel({
                id: NOTIFICATION_CHANNEL_IDS.SOUND_VIBRATE,
                name: 'با صدا و ویبره',
                importance: AndroidImportance.HIGH,
                sound: 'default',
                vibration: true,
            }),
            notifee.createChannel({
                id: NOTIFICATION_CHANNEL_IDS.SOUND_ONLY,
                name: 'فقط صدا',
                importance: AndroidImportance.HIGH,
                sound: 'default',
                vibration: false,
            }),
            notifee.createChannel({
                id: NOTIFICATION_CHANNEL_IDS.SILENT_VIBRATE,
                name: 'فقط ویبره',
                importance: AndroidImportance.HIGH,
                vibration: true,
                // sound تعیین نشده => بی‌صدا
            }),
            notifee.createChannel({
                id: NOTIFICATION_CHANNEL_IDS.SILENT,
                name: 'بی‌صدا',
                importance: AndroidImportance.LOW,
                vibration: false,
            }),
        ]);
    } catch (error) {
        console.error('Failed to create notification channels:', error);
    }
}