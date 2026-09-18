import './gesture-handler';
import 'react-native-get-random-values';
import {AppRegistry} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

const messagingInstance = getMessaging(getApp());

setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
  console.log('Background message handled:', remoteMessage.messageId);
});

AppRegistry.registerComponent(appName, () => App);
