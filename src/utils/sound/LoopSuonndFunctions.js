import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import SoundPlayer from "./SoundPlayer";
import { store } from "../../redux/store/Store";

const activePlayers = {};

export const useBackgroundLoopSound= (musicName, volume = 0.8) => {
  useFocusEffect(
    useCallback(() => {
      let isScreenActive = true; 

      const startMusic = async () => {
        try {
          const state = store.getState();
          if (state.setting.music === true) {
            // ساخت پلیر و ذخیره آن در آبجکت سراسری با کلید نام آهنگ
            const player = await SoundPlayer.create(musicName, false, true, volume);
            activePlayers[musicName] = player;
            
            if (isScreenActive) {
              player.play();
            } else {
              player.release();
              delete activePlayers[musicName];
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
        if (activePlayers[musicName]) {
          activePlayers[musicName].stop();
          activePlayers[musicName].release();
          delete activePlayers[musicName];
        }
      };
    }, [musicName, volume])
  );
};

export const stopSandTimerLoopSound = () => {
  if (activePlayers['clock_tick.ogg']) {
    activePlayers['clock_tick.ogg'].stop();
    activePlayers['clock_tick.ogg'].release();
    delete activePlayers['clock_tick.ogg'];
  }
};




export const useSandTimerLoopSound = (volume = 0.2) => useBackgroundLoopSound('clock_tick.ogg', volume);
