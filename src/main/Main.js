import React, {useEffect, useState} from 'react';
import { StatusBar, SafeAreaView} from 'react-native';
import { MD3LightTheme as PaperDefaultTheme, PaperProvider } from 'react-native-paper';
import {NavigationContainer, DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
import {connect} from 'react-redux';
import Splash from '../screens/splash/Splash';
import MainRoutes from './MainRoutes';
import SignRoutes from './SignRoutes';
import Toast from 'react-native-toast-message';
import ToastConfig from '../components/ToastConfig';
import MyAlert from '../components/alert/MyAlert';
import AlertHelper from '../components/alert/AlertHelper';
import FrontLoad from '../components/frontLoading/FrontLoad';
import LoadingHelper from '../components/frontLoading/LoadingHelper';
import Globals from '../utils/Globals';
import LinearGradient from 'react-native-linear-gradient';

const Main = (props) => {
  
  const theme = Globals.data.configs.themes[props.theme];
  const CustomeTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors : theme
  }
  return (

    <SafeAreaView style={{flex:1}}>
      <PaperProvider theme={CustomeTheme}>
        <StatusBar backgroundColor={"#000000"} barStyle={"light-content"}/>
        <NavigationContainer theme={CustomeTheme}>
          
            {
              props.showSplash == true?
              <Splash/>
              :props.logined == true?
              <MainRoutes/>
              :
              <SignRoutes/>
            }
            <Toast config={ToastConfig}/>
            <MyAlert ref = {Ref => {AlertHelper.setRef(Ref)}}/>
            <FrontLoad ref = {Ref => {LoadingHelper.setRef(Ref)}}/>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaView>
  );
};

const mapStateToProps=state=>{
  return{
    showSplash: state.main.showSplash,
    theme: state.main.theme,
    logined: state.main.logined
  }
}
export default connect(mapStateToProps,{})(Main)