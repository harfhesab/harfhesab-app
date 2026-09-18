import { getApp } from '@react-native-firebase/app';
import { getMessaging, onNotificationOpenedApp, getInitialNotification } from '@react-native-firebase/messaging';

const messagingInstance = getMessaging(getApp());


export function registerNotificationOpenedFromBackground(onOpenNotification) {
    return onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
        if (remoteMessage) {
            onOpenNotification(remoteMessage.data);
        }
    });
}

export async function getNotificationDataIfAppOpenedFromKilled() {
    const remoteMessage = await getInitialNotification(messagingInstance);
    return remoteMessage ? remoteMessage.data : null;
}