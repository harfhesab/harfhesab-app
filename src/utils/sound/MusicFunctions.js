import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import SoundPlayer from "./SoundPlayer";
import { store } from "../../redux/store/Store";

/**
 * هوک مرکزی و کلی برای پخش موسیقی پس‌زمینه
 * @param {string} musicName - نام فایل موسیقی
 * @param {number} volume - میزان صدا
 */
export const useBackgroundMusic = (musicName, volume = 0.8) => {
  useFocusEffect(
    useCallback(() => {
      let player = null;
      let isScreenActive = true; // برای جلوگیری از تداخل در صورت خروج سریع

      const startMusic = async () => {
        try {
          const state = store.getState();
          if (state.setting.music === true) {
            // ساخت پلیر (لوپ فعال است)
            player = await SoundPlayer.create(musicName, false, true, volume);
            
            if (isScreenActive) {
              player.play();
            } else {
              player.release();
            }
          }
        } catch (e) {
          console.log(`Error playing background music ${musicName}:`, e);
        }
      };

      startMusic();

      // Cleanup
      return () => {
        isScreenActive = false;
        if (player) {
          player.stop();
          player.release();
        }
      };
    }, [musicName, volume])
  );
};

// ===================================================================================================================
// ============================= Specific Screen Music Hooks =========================================================
// ===================================================================================================================

/**
 * هوک پخش موزیک برای صفحه لیست مراحل
 */



// ================================= Stage Game Music ================================================================
export const useStageListStageGameMusic = (volume = 0.3) => useBackgroundMusic('music_stage_list.ogg', volume);
export const useWordToSlotStageGameMusic = (volume = 0.2) => useBackgroundMusic('music_word_to_slot.ogg', volume);
export const useConnectingLetterStageGameMusic = (volume = 0.3) => useBackgroundMusic('music_connecting_letter.ogg', volume);
// ================================= Package Game Music ==============================================================
export const useSeasonListPackageGameMusic = (volume = 0.3) => useBackgroundMusic('music_season_list.ogg', volume);
export const useStageListPackageGameMusic = (volume = 0.3) => useBackgroundMusic('music_stage_list.ogg', volume);
export const useWordToSlotPackageGameMusic = (volume = 0.2) => useBackgroundMusic('music_word_to_slot.ogg', volume);
export const useConnectingLetterPackageGameMusic = (volume = 0.3) => useBackgroundMusic('music_connecting_letter.ogg', volume);
