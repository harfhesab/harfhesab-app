import { useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { immersiveController } from './immersiveController';

export function useImmersiveModeNotExit() {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    immersiveController.addNotExitFocused();
    immersiveController.enter();
    return () => {
      // خودش هیچ‌وقت exit نمی‌زند، فقط ثبت حضورش برداشته می‌شود
      immersiveController.removeNotExitFocused();
    };
  }, [isFocused]);
}