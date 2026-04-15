import React, {useEffect, useState} from 'react';
import { StatusBar, SafeAreaView} from 'react-native';
import { MD3LightTheme as PaperDefaultTheme, PaperProvider } from 'react-native-paper';
import {NavigationContainer, DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
import SplashRoutes from './SplashRoutes';
import MainRoutes from './MainRoutes';
import SignRoutes from './SignRoutes';
import Globals from '../utils/Globals';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { navigationRef } from './navigationService';
import Alert from '../components/alert/Alert';
import AlertHelper from '../components/alert/AlertHelper';
import GameAlert from '../components/game-alert/GameAlert';
import GameAlertHelper from '../components/game-alert/GameAlertHelper';
import useAppTheme from '../hooks/theme/useAppTheme';
import AlertBottomDrawer from '../components/alert-bottom-drawer/AlertBottomDrawer';
import AlertBottomDrawerHelper from '../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import Toast from '../components/custom-toast/Toast';
import { toastRef } from '../components/custom-toast/ToastRef';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FullScreenLoadingHelper from '../components/full-screen-loading/FullScreenLoadingHelper';
import FullScreenLoading from '../components/full-screen-loading/FullScreenLoading';
import AlertMessageInApp from '../components/alert-message-in-app/AlertMessageInApp';
import AlertMessageInAppHelper from '../components/alert-message-in-app/AlertMessageInAppHelper';
import { getAllNewMessageInAppForUser } from '../utils/api/GeneralApi';

const Main = (props) => {
  const { token, isLoggedIn } = useSelector((state) => state.account);
  const { splash } = useSelector((state) => state.main);
  const { stageGameLanguage, versionCreatedContent } = useSelector((state) => state.stageGamePersist);
  const colors = useAppTheme();
  const [route, setRoute] = useState("splash")

  const limitedRoute = [
    "WordToSlotStageGame",
    "ConnectingLettersStageGame",
    "WordToSlotPackageGame",
    "ConnectingLettersPackageGame",
  ]

  axios.defaults.headers.post['token'] = token;

  useEffect(()=>{
    if(splash == false && isLoggedIn == true && token && versionCreatedContent > 0 && stageGameLanguage){
      setTimeout(()=>{
        getAllNewMessageInAppForUser()
      }, 2000)
    }
  }, [splash])
  
  return (
    <SafeAreaProvider>
        <StatusBar backgroundColor={colors.status_bar.background} barStyle={colors.status_bar.bar_style}/>
        <NavigationContainer 
          ref={navigationRef}
          onStateChange={(state) => {
            const route = state.routes[state.index].name;
            setRoute(route)
          }}
        >
            {
              splash == true?
              <SplashRoutes/>
              :
              (isLoggedIn == true && token)?
              <MainRoutes/>
              :
              <SignRoutes/>
            }
        </NavigationContainer>
        <Toast ref={toastRef} />
        <GameAlert ref={ref => GameAlertHelper.setRef(ref)} />
        <AlertBottomDrawer ref = {Ref => {AlertBottomDrawerHelper.setRef(Ref)}}/>
        {!limitedRoute.includes(route)&&<Alert ref = {Ref => {AlertHelper.setRef(Ref)}}/>}
        {!limitedRoute.includes(route)&&<AlertMessageInApp ref = {Ref => {AlertMessageInAppHelper.setRef(Ref)}}/>}
        {!limitedRoute.includes(route)&&<FullScreenLoading ref = {Ref => {FullScreenLoadingHelper.setRef(Ref)}}/>}
    </SafeAreaProvider>
  );
};

export default Main