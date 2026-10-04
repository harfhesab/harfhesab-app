import { useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { immersiveController } from './immersiveController';

export function useImmersiveMode() {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      immersiveController.enter();
    }
  }, [isFocused]);

  // ثبت مالکیت تا زمان unmount (مثل رفتار قبلی: فقط با unmount خارج می‌شود)
  useEffect(() => {
    immersiveController.addOwner();
    return () => {
      immersiveController.removeOwner();
      immersiveController.scheduleExit();
    };
  }, []);
}