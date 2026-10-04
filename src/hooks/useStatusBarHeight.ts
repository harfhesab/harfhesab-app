import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, StatusBar } from 'react-native';

export const useStatusBarHeight = () => {
  const insets = useSafeAreaInsets();

  if (insets.top > 0) {
    return insets.top;
  }

  return Platform.OS === 'android'
    ? (StatusBar.currentHeight || 24)
    : 24;
};