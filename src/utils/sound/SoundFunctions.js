import SoundPlayer from "./SoundPlayer";
import { store } from "../../redux/store/Store";

export const playSFX = async (soundName, volume = 1.0) => {
  try {
    const state = store.getState();
    if (!state.setting.sound) return false;

    // جلوگیری از ارسال آبجکتِ Event دکمه‌ها به جای عدد ولوم (رفع ارور جاوا)
    const safeVolume = typeof volume === 'number' && !isNaN(volume) ? volume : 1.0;

    const player = await SoundPlayer.create(soundName, false, false, safeVolume);

    return new Promise((resolve) => {
      player.play((success) => {
        player.release();
        resolve(success); 
      });
    });
  } catch (e) {
    console.log(`خطا در پخش افکت صوتی ${soundName}:`, e);
    return false;
  }
};

// ===================================================================================================================
export const tabScreenSoundInOnClick = (volume = 0.5) => playSFX('tab.wav', volume);
// ===================================================================================================================
// ============================= Word To Slot ========================================================================
export const onStartDragWordToSlotCardSound = (volume = 0.8) => playSFX('pop.wav', volume);
export const dropWordToSlotCardInFloatingSound = (volume = 0.9) => playSFX('soft_whoosh.wav', volume);
export const dropWordToSlotCardInSlotSound = (volume = 0.9) => playSFX('snap.wav', volume);

export const successfulCompletionOfStageSound = async(volume = 1) => {
  // حذف await برای اینکه صدای موفقیت و سکه همزمان پخش شوند
  await playSFX('success.wav', volume);
  await playSFX('coin_reward.wav', volume);
};

export const typingSentenceSucccessSound = (volume = 0.8) => playSFX('connected_1.wav', volume);
export const typingSentenceErrorSound = (volume = 0.8) => playSFX('denied.wav', volume);

export const successfulCompletionOfSeasonSound = async(volume = 1) => {
  await playSFX('level_up.wav', volume);
  await playSFX('coin_reward.wav', volume);
};
// ===================================================================================================================
// ============================== Connecting Letter ==================================================================
export const connectingLetterSucccessSound = (volume = 0.8) => playSFX('connected_1.wav', volume);
export const connectingLetterDuplicateSound = (volume = 0.2) => playSFX('notification.wav', volume);
export const connectingLetterErrorSound = (volume = 0.8) => playSFX('denied.wav', volume);
export const selectCardSoundInLettersConnecting = (volume = 0.8) => playSFX('whoop.wav', volume);
export const deselectCardSoundInLettersConnecting = (volume = 0.8) => playSFX('pop.wav', volume);

export const successfulCompletionOfConnectingLetterSound = async(volume = 1) => {
  await playSFX('success.wav', volume);
  await playSFX('coin_reward.wav', volume);
};
// ===================================================================================================================
// ============================= Coin Sound ==========================================================================
export const coinCountUpdateSound = (volume = 0.2) => playSFX('coin.ogg', volume);

// ===================================================================================================================
// ============================= Harf Akhar =========================================================================
export const harfAkharChallengeTimeIsOverSound = (volume = 1) => playSFX('level_up.wav', volume);
export const successfulCompletionOfHarfAkharChallenge = async(volume = 1) => {
  await playSFX('level_up.wav', volume);
  await playSFX('coin_reward.wav', volume);
};