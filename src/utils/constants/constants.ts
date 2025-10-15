import { Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

export const IS_TABLET_CONDITION = Math.min(width, height) >= 600;
export const STATUS_BAR_HEIGHT = StatusBar.currentHeight ?? 0;