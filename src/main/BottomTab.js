import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet, Text, View } from 'react-native';
import MyTransCall from '../hooks/translations/MyTrans';
import Font from '../utils/Font';
import Icon from '../utils/Icon';
import PackageGame from '../screens/main/package-game/PackageGame';
import StageGame from '../screens/main/stage-game/StageGame';
import Account from '../screens/main/account/Account';
import OnlineGame from '../screens/main/online-game/OnlineGame';
import FastImage from '@d11/react-native-fast-image';
import useAppTheme from '../hooks/theme/useAppTheme';

const Tab = createBottomTabNavigator();
const BottomTab = (props) => {
  const colors = useAppTheme()
  
  return (
    <Tab.Navigator
      initialRouteName="StageGame"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.bottom_tab.active,
        tabBarInactiveTintColor: colors.bottom_tab.inactive,
        tabBarStyle: [
          {
            display: "flex",
            height:65,
            backgroundColor: colors.bottom_tab.background,
            borderTopWidth: 0.3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          },
          null
        ]
      }}
    >
        <Tab.Screen
          name="StageGame"
          component={StageGame}
          options={{
            tabBarLabel : ({color}) => (
              <Text style={[styles.lable, {color:color}]}>{"بازی مرحله‌ای"}</Text>
            ),
            tabBarIcon : ({color, size, focused}) => (
              <Icon name={focused?'game-controller':'game-controller-outline'} type={'Ionicons'} style={{color:color, fontSize:size*1.1}}/>
            )
          }}
        />
        <Tab.Screen
          name="PackageGame"
          component={PackageGame}
          options={{
            tabBarLabel : ({color}) => (
              <Text style={[styles.lable, {color:color}]}>{"بسته‌های بازی"}</Text>
            ),
            tabBarIcon : ({color, size, focused}) => (
              <Icon name={focused?'grid':'grid-outline'} type={'Ionicons'} style={{color:color, fontSize:size*1.1}}/>
            )
          }}
        />
        <Tab.Screen
          name="OnlineGame"
          component={OnlineGame}
          options={{
            tabBarLabel : ({color}) => (
              <Text style={[styles.lable, {color:color}]}>{"بازی آنلاین"}</Text>
            ),
            tabBarIcon : ({color, size, focused}) => (
              <Icon name={focused?'trail-sign':'trail-sign-outline'} type={'Ionicons'} style={{color:color, fontSize:size*1.1}}/>
            )
          }}
        />
        <Tab.Screen
          name="Account"
          component={Account}
          options={{
            tabBarLabel : ({color}) => (
              <Text style={[styles.lable, {color:color}]}>{"حساب کاربری"}</Text>
            ),
            tabBarIcon : ({color, size, focused}) => (
              <Icon name={focused?'person':'person-outline'} type={'Ionicons'} style={{color:color, fontSize:size*1.1}}/>
            )
          }}
        />
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  lable: {
    fontSize:10,
    fontFamily:Font.medium,
  },
});
export default BottomTab;