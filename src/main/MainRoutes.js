import React, {useEffect} from 'react';
import { AppState, NativeModules } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getCurrentRouteName } from './navigationService';
import BottomTab from './BottomTab';
import WordToSlotStageGame from '../screens/main/stage-game/game/WordToSlotStageGame';
import ConnectingLettersStageGame from '../screens/main/stage-game/game/ConnectingLettersStageGame';
import StagesStageGameSeason from '../screens/main/stage-game/StagesStageGameSeason';
import LoginToAccount from '../screens/main/account/login/LoginToAccount';
import VerifyLoginToAccount from '../screens/main/account/login/VerifyLoginToAccount';
import PackageInformation from '../screens/main/package-game/PackageInformation';
import UserPackagesList from '../screens/main/package-game/UserPackagesList';
import StagesPackageGameSeason from '../screens/main/package-game/StagesPackageGameSeason';
import ConnectingLettersPackageGame from '../screens/main/package-game/game/ConnectingLettersPackageGame';
import WordToSlotPackageGame from '../screens/main/package-game/game/WordToSlotPackageGame';
import AccountManagement from '../screens/main/account/AccountManagement';
import CoinPlans from '../screens/main/account/CoinPlans';
import SubscriptionPlans from '../screens/main/account/SubscriptionPlans';
import StartPackageGame from '../screens/main/package-game/StartPackageGame';
import Setting from '../screens/main/account/Setting';
import FreeCoin from '../screens/main/account/FreeCoin';
import ImageScreen from '../screens/single-page/ImageScreen';
import ViewAllPackageRating from '../screens/main/package-game/ViewAllPackageRating';
import Notification from '../screens/main/account/Notification';
import MessageInApp from '../screens/main/account/MessageInApp';
import StageGameUpdateScreen from '../screens/main/account/StageGameUpdateScreen';
import KalamAkhar from '../screens/main/online-game/kalam-akhar/KalamAkhar';
import KalamAkharInformation from '../screens/main/online-game/kalam-akhar/KalamAkharInformation';


const Stack = createNativeStackNavigator();

const { ImmersiveMode } = NativeModules;
const MainRoutes = (props) =>{

  const limitedRoute = [
    "WordToSlotStageGame",
    "ConnectingLettersStageGame",
    "StagesStageGameSeason",
    "WordToSlotPackageGame",
    "ConnectingLettersPackageGame",
    "StagesPackageGameSeason",
    "StartPackageGame"
  ]

  useEffect(()=>{
    const listenner = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      listenner.remove()
    };
  }, [])

  const handleAppStateChange = (nextAppState) => {
    if(nextAppState === 'active'){
      const currentRoute = getCurrentRouteName();
      if(limitedRoute.includes(currentRoute)){
        ImmersiveMode.enterImmersiveMode();
      }
    }
  };

  return(
    <Stack.Navigator screenOptions={{headerShown:false}} >
      <Stack.Screen name={"BottomTab"} component={BottomTab} />
      <Stack.Screen name={"WordToSlotStageGame"} component={WordToSlotStageGame} />
      <Stack.Screen name={"ConnectingLettersStageGame"} component={ConnectingLettersStageGame} />
      <Stack.Screen name={"StagesStageGameSeason"} component={StagesStageGameSeason} />
      <Stack.Screen name={"LoginToAccount"} component={LoginToAccount} />
      <Stack.Screen name={"VerifyLoginToAccount"} component={VerifyLoginToAccount} />
      <Stack.Screen name={"PackageInformation"} component={PackageInformation} />
      <Stack.Screen name={"UserPackagesList"} component={UserPackagesList} />
      <Stack.Screen name={"CoinPlans"} component={CoinPlans} />
      <Stack.Screen name={"SubscriptionPlans"} component={SubscriptionPlans} />
      <Stack.Screen name={"StartPackageGame"} component={StartPackageGame} />
      <Stack.Screen name={"StagesPackageGameSeason"} component={StagesPackageGameSeason} />
      <Stack.Screen name={"ConnectingLettersPackageGame"} component={ConnectingLettersPackageGame} />
      <Stack.Screen name={"WordToSlotPackageGame"} component={WordToSlotPackageGame} />
      <Stack.Screen name={"AccountManagement"} component={AccountManagement} />
      <Stack.Screen name={"Setting"} component={Setting} />
      <Stack.Screen name={"FreeCoin"} component={FreeCoin} />
      <Stack.Screen name={"ImageScreen"} component={ImageScreen} />
      <Stack.Screen name={"ViewAllPackageRating"} component={ViewAllPackageRating} />
      <Stack.Screen name={"Notification"} component={Notification} />
      <Stack.Screen name={"MessageInApp"} component={MessageInApp} />
      <Stack.Screen name={"StageGameUpdateScreen"} component={StageGameUpdateScreen} />
      <Stack.Screen name={"KalamAkhar"} component={KalamAkhar} />
      <Stack.Screen name={"KalamAkharInformation"} component={KalamAkharInformation} />
    </Stack.Navigator>
  )
}
export default MainRoutes