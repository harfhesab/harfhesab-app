import React from 'react';
import { StatusBar, SafeAreaView} from 'react-native';
import { MD3LightTheme as PaperDefaultTheme, PaperProvider } from 'react-native-paper';
import {NavigationContainer, DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
import MainRoutes from './MainRoutes';
import SignRoutes from './SignRoutes';
import Toast from 'react-native-toast-message';
import ToastConfig from '../components/ToastConfig';
import Globals from '../utils/Globals';
import { useSelector } from 'react-redux';
import Color from '../utils/Color';
import axios from 'axios';
import { navigationRef } from './navigationService';
import Alert from '../components/alert/Alert';
import AlertHelper from '../components/alert/AlertHelper';
import GameAlert from '../components/game-alert/GameAlert';
import GameAlertHelper from '../components/game-alert/GameAlertHelper';

const Main = (props) => {
  const { token, isLoggedIn } = useSelector((state) => state.auth);

  axios.defaults.headers.post['token'] = token;
  
  return (
    <SafeAreaView style={{flex:1}}>
        <StatusBar backgroundColor={"#000000"} barStyle={"light-content"}/>
        <NavigationContainer 
          ref={navigationRef}
        >
            {
              (isLoggedIn == true && token)?
              <MainRoutes/>
              :
              <SignRoutes/>
            }
        </NavigationContainer>
        <Toast config={ToastConfig}/>
        <Alert ref = {Ref => {AlertHelper.setRef(Ref)}}/>
        <GameAlert ref={ref => GameAlertHelper.setRef(ref)} />
    </SafeAreaView>
  );
};

export default Main