import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/sign/Login';
import VerifyWithOTP from '../screens/sign/VerifyWithOTP';

const Stack = createNativeStackNavigator();

const SignRoutes = () =>{
  return(
    <Stack.Navigator screenOptions={{headerShown:false}} >
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='VerifyWithOTP' component={VerifyWithOTP} />
    </Stack.Navigator>
  )
}

export default SignRoutes;