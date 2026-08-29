import React, {useMemo} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import Icon from '../../../../utils/Icon';
import Font from '../../../../utils/Font';
import HarfAkhar from './HarfAkhar';
import HarfAkharPlaying from './HarfAkharPlaying';

const Tab = createBottomTabNavigator();

const TAB_BAR_HEIGHT = 75;
const ICON_LABEL_GAP = 5;
const ICON_BACKGROUND = require('../../../../assets/image/circle_red_frame.png');

const TAB_CONFIG = [
  {
    name: 'HarfAkhar',
    component: HarfAkhar,
    label: 'حرف آخر',
    iconActive: 'ticket',
    iconInactive: 'ticket-outline',
    lazy: false
  },
  {
    name: 'HarfAkharPlaying',
    component: HarfAkharPlaying,
    label: 'شروع شده',
    iconActive: 'game-controller',
    iconInactive: 'game-controller-outline',
    lazy: true
  },
];

const TabIcon = ({color, size, focused, iconActive, iconInactive}) => (
  <ImageBackground
    source={ICON_BACKGROUND}
    style={[styles.iconBg, {width: size * 1.6, height: size * 1.6}]}
    imageStyle={{resizeMode: 'stretch', opacity: focused ? 1 : 0.7}}
    resizeMode="stretch">
    <Icon
      name={focused ? iconActive : iconInactive}
      type="Ionicons"
      style={{color, fontSize: size*0.9}}
    />
  </ImageBackground>
);

const TabLabel = ({color, label}) => (
  <Text
    style={[styles.label, {color}]}
    numberOfLines={1}
    ellipsizeMode="tail">
    {label}
  </Text>
);

const TabBarItem = ({color, size, focused, iconActive, iconInactive, label}) => (
  <View style={styles.tabItem}>
    <TabIcon
      color={color}
      size={size}
      focused={focused}
      iconActive={iconActive}
      iconInactive={iconInactive}
    />
    <TabLabel color={color} label={label} />
  </View>
);

const HarfAkharBottomTab = () => {
  const colors = useAppTheme();

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: colors.primary.a5,
      tabBarInactiveTintColor: `${colors.primary.a5}80`,
      tabBarStyle: styles.tabBar,
      tabBarItemStyle: styles.tabBarItem,
      tabBarIconStyle: styles.tabBarIcon,
    }),
    [colors.primary.a5],
  );

  return (
    <Tab.Navigator initialRouteName="HarfAkhar" screenOptions={screenOptions}>
      {TAB_CONFIG.map(({name, component, label, iconActive, iconInactive, lazy}) => (
        <Tab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            lazy:lazy,
            tabBarIcon: ({color, size, focused}) => (
              <TabBarItem
                color={color}
                size={size}
                focused={focused}
                iconActive={iconActive}
                iconInactive={iconInactive}
                label={label}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: TAB_BAR_HEIGHT,
    backgroundColor: '#12042699',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'absolute',
    borderTopWidth: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  tabBarItem: {
    height: TAB_BAR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  tabBarIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: ICON_LABEL_GAP,
    flexShrink: 1,
    maxWidth: '100%',
  },
  iconBg: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    fontSize: 14,
    fontFamily: Font.bakh_bold,
    flexShrink: 1,
  },
});

export default HarfAkharBottomTab;