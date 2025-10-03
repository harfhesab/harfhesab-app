import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from '../screens/splash/Splash';


const Stack = createNativeStackNavigator();

const SplashRoutes = () =>{
  return(
    <Stack.Navigator screenOptions={{headerShown:false}} >
      <Stack.Screen name='Splash' component={Splash} />
    </Stack.Navigator>
  )
}

export default SplashRoutes;