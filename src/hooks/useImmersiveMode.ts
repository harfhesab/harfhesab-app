import { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const { ImmersiveMode } = NativeModules;

export function useImmersiveMode() {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      ImmersiveMode.enterImmersiveMode();
    }
  }, [isFocused]);

  useEffect(() => {
    return () => {
      ImmersiveMode.exitImmersiveMode();
    };
  }, []);
}