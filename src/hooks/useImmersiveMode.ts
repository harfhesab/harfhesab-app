import { useEffect } from 'react';
import { NativeModules, StatusBar } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const { ImmersiveMode } = NativeModules;

export function useImmersiveMode() {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      ImmersiveMode.enterImmersiveMode();
      StatusBar.setHidden(true);
    }
  }, [isFocused]);

  useEffect(() => {
    return () => {
      ImmersiveMode.exitImmersiveMode();
      StatusBar.setHidden(false);
    };
  }, []);
}