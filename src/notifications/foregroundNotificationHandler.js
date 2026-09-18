import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import notifee, { AndroidStyle } from 'react-native-notify-kit';
import { NOTIFICATION_CHANNEL_IDS } from './notificationChannels';

const messagingInstance = getMessaging(getApp());

/**
 * وقتی اپ در foreground است، onMessage پیام را دریافت می‌کند اما
 * هیچ UI‌ای خودکار نمایش نمی‌دهد. این تابع مسئول نمایش دستی آن با notify-kit است.
 */
export function registerForegroundMessageHandler() {
    return onMessage(messagingInstance, async (remoteMessage) => {
        try {
            await displayForegroundNotification(remoteMessage);
        } catch (error) {
            console.error('Failed to display foreground notification:', error);
        }
    });
}

async function displayForegroundNotification(remoteMessage) {
    const { notification, data } = remoteMessage;

    if (!notification) {
        // پیام صرفاً data-only بود، چیزی برای نمایش وجود ندارد
        return;
    }

    const channelId =
        remoteMessage.notification?.android?.channelId ||
        data?.channel_id ||
        NOTIFICATION_CHANNEL_IDS.SOUND_VIBRATE;

    const imageUrl = notification.android?.imageUrl || notification.imageUrl;

    await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        data: data || {},
        android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: { id: 'default' },
            ...(imageUrl && {
                largeIcon: imageUrl,
                style: {
                    type: AndroidStyle.BIGPICTURE,
                    picture: imageUrl,
                },
            }),
        },
        ios: {
            sound: notification.apple?.sound,
        },
    });
}