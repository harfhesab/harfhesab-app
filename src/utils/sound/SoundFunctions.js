import SoundPlayer from "./SoundPlayer";
import { store } from "../../redux/store/Store";

/**
 * تابع مرکزی برای پخش افکت‌های صوتی کوتاه (SFX)
 * @param {string} soundName - نام فایل صوتی
 * @param {number} volume - میزان صدا
 * @returns {Promise<boolean>} - آیا پخش موفقیت آمیز بود؟
 */
export const playSFX = async (soundName, volume = 1.0) => {
  try {
    const state = store.getState();
    if (!state.setting.sound) return false;

    const player = await SoundPlayer.create(soundName, false, false, volume);

    // تبدیل کال‌بک به پرامیس برای مدیریت راحت‌تر
    return new Promise((resolve) => {
      player.play((success) => {
        player.release(); // چه موفق بود چه نبود، حافظه باید آزاد بشه
        resolve(success); // نتیجه رو برمیگردونیم
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
export const dropWordToSlotCardInFloatingSound = (volume = 1) => playSFX('soft_whoosh.wav', volume);
export const dropWordToSlotCardInSlotSound = (volume = 0.8) => playSFX('snap.wav', volume);
export const successfulCompletionOfStageSound = async (volume = 1) => {
  await playSFX('success.wav', volume);
  await playSFX('coin_reward.wav', volume);
};
export const typingSentenceSucccessSound = (volume = 0.8) => playSFX('connected_1.wav', volume);
export const typingSentenceErrorSound = (volume = 0.9) => playSFX('denied.wav', volume);
export const successfulCompletionOfSeasonSound = async (volume = 1) => {
  await playSFX('level_up.wav', volume);
  await playSFX('coin_reward.wav', volume);
};
// ===================================================================================================================
// ============================== Connecting Letter ==================================================================
export const connectingLetterSucccessSound = (volume = 0.8) => playSFX('connected_1.wav', volume);
export const connectingLetterDuplicateSound = (volume = 0.2) => playSFX('notification.wav', volume);
export const connectingLetterErrorSound = (volume = 0.9) => playSFX('denied.wav', volume);
export const selectCardSoundInLettersConnecting = (volume = 0.8) => playSFX('whoop.wav', volume);
export const deselectCardSoundInLettersConnecting = (volume = 0.8) => playSFX('pop.wav', volume);
export const successfulCompletionOfConnectingLetterSound = async (volume = 1) => {
  await playSFX('success.wav', volume);
  await playSFX('coin_reward.wav', volume);
};
// ===================================================================================================================
// ============================= Coin Sound ==========================================================================
export const coinCountUpdateSound = (volume = 0.2) => playSFX('coin.ogg', volume);