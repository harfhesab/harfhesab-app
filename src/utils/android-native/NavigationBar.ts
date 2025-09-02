import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'NavigationBar' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You are not on iOS 🙂\n", default: '' }) +
  "- You have run 'pod install' (if iOS, ولی اینجا فقط اندروید هست)\n" +
  "- You rebuilt the app after installing the module\n";

type NavigationBarType = {
  /**
   * تغییر رنگ NavigationBar
   * @param colorHex رنگ به فرمت "#RRGGBB" یا "#AARRGGBB"
   */
  setColor(colorHex: string): void;
};

const { NavigationBar } = NativeModules;

if (!NavigationBar) {
  throw new Error(LINKING_ERROR);
}

export default NavigationBar as NavigationBarType;
