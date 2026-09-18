import React, {useEffect} from 'react';
import { Provider } from "react-redux";
import { store, persistor } from './src/redux/store/Store';
import { PersistGate } from 'redux-persist/integration/react';
import Main from './src/main/Main';
import { RealmProviderWrapper } from './src/realm/RealmProviderWrapper';
import axios from 'axios';
import Globals from './src/utils/Globals';
import { SkiaFontProvider } from './src/context/SkiaFontProvider';
import { ProvidersLoader } from './src/components/loader/ProvidersLoader';
import { createNotificationChannels } from './src/notifications/notificationChannels';
import { registerForegroundMessageHandler } from './src/notifications/foregroundNotificationHandler';
import {
    registerNotificationOpenedFromBackground,
    getNotificationDataIfAppOpenedFromKilled,
} from './src/notifications/notificationOpenHandler';
import {
    navigateFromNotificationData,
    queueNotificationDataForAfterSplash,
} from './src/notifications/notificationNavigationService';
import notifee, { EventType } from 'react-native-notify-kit';


axios.defaults.baseURL = Globals.baseURL;
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.headers.post['client'] = 'user';
function App(): React.JSX.Element {

  useEffect(() => {
      createNotificationChannels();

      // نمایش دستی نوتیف وقتی اپ در foreground است
      const unsubscribeForegroundDisplay = registerForegroundMessageHandler();

      // کلیک روی نوتیفی که خودمان با notifee در foreground نمایش دادیم
      // اپ از قبل کاملاً بالا و آماده است، پس ناوبری فوری مشکلی ندارد
      const unsubscribeForegroundPress = notifee.onForegroundEvent(({ type, detail }) => {
          if (type === EventType.PRESS) {
              navigateFromNotificationData(detail.notification?.data);
          }
      });

      // کلیک روی نوتیفِ سیستمی وقتی اپ در background بوده (نه killed)
      // اپ از قبل کامل بالا آمده و از Splash عبور کرده، پس ناوبری فوری درست است
      const unsubscribeBackgroundOpen = registerNotificationOpenedFromBackground((data:any) => {
          navigateFromNotificationData(data);
      });

      // حالت killed: اپ با کلیک روی نوتیف تازه باز می‌شود.
      // اینجا ناوبری نمی‌کنیم؛ فقط صف می‌کنیم تا Splash کارش را کامل تمام کند
      // و خودش در پایان (hideSplashAndStartApp) این را اجرا کند.
      getNotificationDataIfAppOpenedFromKilled().then((data) => {
          if (data) {
              queueNotificationDataForAfterSplash(data);
          }
      });

      return () => {
          unsubscribeForegroundDisplay();
          unsubscribeForegroundPress();
          unsubscribeBackgroundOpen();
      };
  }, []);


  return (
    <RealmProviderWrapper>
      <Provider store={store}> 
        <PersistGate loading={<ProvidersLoader />} persistor={persistor}>
          <SkiaFontProvider>
            <Main/>
          </SkiaFontProvider>
        </PersistGate>
      </Provider>
    </RealmProviderWrapper>
  );
}

export default App;