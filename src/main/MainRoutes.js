import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTab from './BottomTab';
import StageGameUpdateScreen from '../screens/main/update-center/StageGameUpdateScreen';
import WordToSlotStageGame from '../screens/main/stage-game/game/WordToSlotStageGame';
import ConnectingLettersStageGame from '../screens/main/stage-game/game/ConnectingLettersStageGame';
import StagesStageGameSeason from '../screens/main/stage-game/StagesStageGameSeason';

const Stack = createNativeStackNavigator();

const MainRoutes = (props) =>{

  return(
    <Stack.Navigator screenOptions={{headerShown:false}} >
      <Stack.Screen name={"BottomTab"} component={BottomTab} />
      <Stack.Screen name={"StageGameUpdateScreen"} component={StageGameUpdateScreen} />
      <Stack.Screen name={"WordToSlotStageGame"} component={WordToSlotStageGame} />
      <Stack.Screen name={"ConnectingLettersStageGame"} component={ConnectingLettersStageGame} />
      <Stack.Screen name={"StagesStageGameSeason"} component={StagesStageGameSeason} />
    </Stack.Navigator>
  )
}
export default MainRoutes