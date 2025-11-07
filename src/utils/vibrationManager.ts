import { Vibration, Platform } from 'react-native';
import { store } from "../redux/store/Store";

type VibrationPattern = number | number[];

interface VibrationOptions {
  pattern?: VibrationPattern;
  repeat?: boolean;
}


export const vibrate = (options?: VibrationOptions) => {
  const state = store.getState()
  if(state.setting.vibration == true){
    const pattern = options?.pattern ?? 70;
    const repeat = options?.repeat ?? false;

    if (Array.isArray(pattern)) {
      Vibration.vibrate(pattern, Platform.OS === 'android' && repeat);
    } else {
      Vibration.vibrate(pattern);
    }
  }
};

export const cancelVibration = () => {
  Vibration.cancel();
};
