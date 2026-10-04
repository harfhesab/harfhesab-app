import React, {useCallback, useMemo} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import GameTabBar from '../../../../components/Gametabbar'; 
import HarfAkhar from './HarfAkhar';
import HarfAkharPlaying from './HarfAkharPlaying';
import {useHarfAkharListMusic} from '../../../../utils/sound/MusicFunctions';
import { useImmersiveMode } from '../../../../hooks/useImmersiveMode';

const Tab = createBottomTabNavigator();

// پس‌زمینه‌ی نیمه‌شفاف تا پارتیکل‌های آسمان شب از پشت دیده شوند
const TAB_BAR_BG = '#12042699';
const INACTIVE_COLOR = '#A89CC0';

const TAB_CONFIG = [
  {
    name: 'HarfAkhar',
    component: HarfAkhar,
    label: 'حرف آخر',
    iconActive: 'ticket',
    iconInactive: 'ticket-outline',
    lazy: false,
  },
  {
    name: 'HarfAkharPlaying',
    component: HarfAkharPlaying,
    label: 'شروع شده',
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

const HarfAkharBottomTab = () => {
  useImmersiveMode()
  useHarfAkharListMusic();
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
        absolute
      />
    ),
    [accent],
  );

  return (
    <Tab.Navigator
      initialRouteName="HarfAkhar"
      screenOptions={screenOptions}
      tabBar={renderTabBar}>
      {TAB_CONFIG.map(({name, component, lazy}) => (
        <Tab.Screen key={name} name={name} component={component} options={{lazy}} />
      ))}
    </Tab.Navigator>
  );
};

export default HarfAkharBottomTab;