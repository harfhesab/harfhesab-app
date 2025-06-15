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

const Main = (props) => {
  const { token, isLoggedIn } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  const selectedTheme = Color.themes[theme];
  const CustomeTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors : selectedTheme
  }
  return (
    <SafeAreaView style={{flex:1}}>
      <PaperProvider theme={CustomeTheme}>
        <StatusBar backgroundColor={"#000000"} barStyle={"light-content"}/>
        <NavigationContainer theme={CustomeTheme}>
          
            {
              (isLoggedIn == true && token)?
              <MainRoutes/>
              :
              <SignRoutes/>
            }
            <Toast config={ToastConfig}/>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaView>
  );
};

export default Main