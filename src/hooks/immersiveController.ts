import { NativeModules } from 'react-native';

const { ImmersiveMode } = NativeModules;

const EXIT_DELAY_MS = 150;

let exitTimer: ReturnType<typeof setTimeout> | null = null;
let owners = 0;          // تعداد صفحه‌های مانت‌شده با useImmersiveMode
let notExitFocused = 0;  // تعداد صفحه‌های فوکوس‌شده با useImmersiveModeNotExit

const cancelExit = () => {
  if (exitTimer) {
    clearTimeout(exitTimer);
    exitTimer = null;
  }
};

export const immersiveController = {
  enter() {
    cancelExit();
    ImmersiveMode.enterImmersiveMode();
  },

  // exit با تأخیر؛ فقط اگر هیچ صفحه‌ای هنوز immersive نخواهد اجرا می‌شود
  scheduleExit() {
    cancelExit();
    exitTimer = setTimeout(() => {
      exitTimer = null;
      if (owners === 0 && notExitFocused === 0) {
        ImmersiveMode.exitImmersiveMode();
      }
    }, EXIT_DELAY_MS);
  },

  addOwner() {
    owners += 1;
  },
  removeOwner() {
    owners = Math.max(0, owners - 1);
  },
  addNotExitFocused() {
    notExitFocused += 1;
  },
  removeNotExitFocused() {
    notExitFocused = Math.max(0, notExitFocused - 1);
  },
};