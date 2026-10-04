import React, {useCallback, useMemo} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import GameTabBar from '../../../components/Gametabbar';
import PackageGame from './PackageGame';
import UserPackagesList from './UserPackagesList';
import useAppTheme from '../../../hooks/theme/useAppTheme';

const Tab = createBottomTabNavigator();

const TAB_BAR_BG = '#001012';
const INACTIVE_COLOR = '#8E82A6';

const TAB_CONFIG = [
  {
    name: 'PackageGame',
    component: PackageGame,
    label: 'بسته‌های بازی',
    iconActive: 'grid',
    iconInactive: 'grid-outline',
    lazy: false,
  },
  {
    name: 'UserPackagesList',
    component: UserPackagesList,
    label: 'بسته‌های من',
    iconActive: 'game-controller',
    iconInactive: 'game-controller-outline',
    lazy: true,
  },
];

const TAB_ITEMS = Object.fromEntries(
  TAB_CONFIG.map(({name, label, iconActive, iconInactive}) => [
    name,
    {label, iconActive, iconInactive},
  ]),
);

const PackageGameBottomTab = () => {
  const colors = useAppTheme();
  const accent = colors.primary.a5;

  const screenOptions = useMemo(() => ({headerShown: false}), []);

  const renderTabBar = useCallback(
    props => (
      <GameTabBar
        {...props}
        items={TAB_ITEMS}
        accent={accent}
        backgroundColor={TAB_BAR_BG}
        inactiveColor={INACTIVE_COLOR}
      />
    ),
    [accent],
  );

  return (
    <Tab.Navigator
      initialRouteName="PackageGame"
      screenOptions={screenOptions}
      tabBar={renderTabBar}>
      {TAB_CONFIG.map(({name, component, lazy}) => (
        <Tab.Screen key={name} name={name} component={component} options={{lazy}} />
      ))}
    </Tab.Navigator>
  );
};

export default PackageGameBottomTab;