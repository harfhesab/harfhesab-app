import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTab from './BottomTab';

const Stack = createNativeStackNavigator();

const MainRoutes = (props) =>{

  return(
    <Stack.Navigator screenOptions={{headerShown:false}} >
      <Stack.Screen name={"BottomTab"} component={BottomTab} />
    </Stack.Navigator>
  )
}
export default MainRoutes