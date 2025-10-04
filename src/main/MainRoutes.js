import React, {useEffect} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTab from './BottomTab';
import StageGameUpdateScreen from '../screens/main/update-center/StageGameUpdateScreen';
import WordToSlotStageGame from '../screens/main/stage-game/game/WordToSlotStageGame';
import ConnectingLettersStageGame from '../screens/main/stage-game/game/ConnectingLettersStageGame';
import StagesStageGameSeason from '../screens/main/stage-game/StagesStageGameSeason';
import LoginToAccount from '../screens/main/account/login/LoginToAccount';
import VerifyLoginToAccount from '../screens/main/account/login/VerifyLoginToAccount';
import PackageInformation from '../screens/main/package-game/PackageInformation';
import UserPackagesList from '../screens/main/package-game/UserPackagesList';
// ==================================================================================================
import { AppState } from 'react-native';
import { getCurrentRouteName } from './navigationService';
import NavigationBar from '../utils/android-native/NavigationBar';
import CoinPlans from '../screens/main/account/CoinPlans';
import SubscriptionPlans from '../screens/main/account/SubscriptionPlans';

const Stack = createNativeStackNavigator();

const MainRoutes = (props) =>{

  useEffect(()=>{
    const listenner = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      listenner.remove()
    };
  }, [])

  const handleAppStateChange = (nextAppState) => {
    if(nextAppState === 'active'){
      const currentRoute = getCurrentRouteName();
      if(currentRoute === "StagesStageGameSeason" || currentRoute === "WordToSlotStageGame" || currentRoute === "ConnectingLettersStageGame"){
        NavigationBar.hide();
      }
    }
  };

  return(
    <Stack.Navigator screenOptions={{headerShown:false}} >
      <Stack.Screen name={"BottomTab"} component={BottomTab} />
      <Stack.Screen name={"StageGameUpdateScreen"} component={StageGameUpdateScreen} />
      <Stack.Screen name={"WordToSlotStageGame"} component={WordToSlotStageGame} />
      <Stack.Screen name={"ConnectingLettersStageGame"} component={ConnectingLettersStageGame} />
      <Stack.Screen name={"StagesStageGameSeason"} component={StagesStageGameSeason} />
      <Stack.Screen name={"LoginToAccount"} component={LoginToAccount} />
      <Stack.Screen name={"VerifyLoginToAccount"} component={VerifyLoginToAccount} />
      <Stack.Screen name={"PackageInformation"} component={PackageInformation} />
      <Stack.Screen name={"UserPackagesList"} component={UserPackagesList} />
      <Stack.Screen name={"CoinPlans"} component={CoinPlans} />
      <Stack.Screen name={"SubscriptionPlans"} component={SubscriptionPlans} />
    </Stack.Navigator>
  )
}
export default MainRoutes