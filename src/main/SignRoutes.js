import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/sign/Login';
import VerifyWithOTP from '../screens/sign/VerifyWithOTP';
import SignIn from '../screens/sign/SignIn';
import IntroOnboarding from '../screens/sign/IntroOnboarding';
import { useSelector } from 'react-redux';


const Stack = createNativeStackNavigator();

const SignRoutes = () =>{
  const { onboarded } = useSelector((state) => state.main);
  return(
    <Stack.Navigator initialRouteName={onboarded?"SignIn":"IntroOnboarding"} screenOptions={{headerShown:false}} >
      <Stack.Screen name='SignIn' component={SignIn} />
      <Stack.Screen name='IntroOnboarding' component={IntroOnboarding} />
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='VerifyWithOTP' component={VerifyWithOTP} />
    </Stack.Navigator>
  )
}

export default SignRoutes;