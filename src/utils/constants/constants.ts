import { Dimensions, StatusBar } from 'react-native';

const { width } = Dimensions.get('screen');

export const IS_TABLET_CONDITION = width >= 600;
export const STATUS_BAR_HEIGHT = StatusBar.currentHeight || 24;
