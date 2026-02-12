import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: string;
  sound: boolean;
  music: boolean;
  vibration: boolean;
  // ====================================================================
  // ====================================================================
  firstGuide: boolean;
  wordToSlotGuide: boolean;
  unknownWordGuide: boolean;
  connectingLetterGuide: boolean;
}

const initialState: UiState = {
  theme: "t1",
  sound: true,
  music: true,
  vibration: true,
  // =====================================================================
  // =====================================================================
  firstGuide: false,
  wordToSlotGuide: false,
  unknownWordGuide: false,
  connectingLetterGuide: false
};

const settingSlice = createSlice({
  name: 'setting',
  initialState,
  reducers: {
    changeTheme(
      state,
      action: PayloadAction<{ theme: string }>
    ) {
      state.theme = action.payload.theme;
    },
    changeSoundGame(
      state,
      action: PayloadAction<{ sound: boolean }>
    ) {
      state.sound = action.payload.sound;
    },
    changeMusicGame(
      state,
      action: PayloadAction<{ music: boolean }>
    ) {
      state.music = action.payload.music;
    },
    changeVibrationGame(
      state,
      action: PayloadAction<{ vibration: boolean }>
    ) {
      state.vibration = action.payload.vibration;
    },
    // =====================================================================
    // =====================================================================
    seenFirstGuide(
      state,
    ) {
      state.firstGuide = true;
    },
    seenWordToSlotGuide(
      state,
    ) {
      state.wordToSlotGuide = true;
    },
    seenUnknownWordGuide(
      state,
    ) {
      state.unknownWordGuide = true;
    },
    seenConnectingLetterGuide(
      state,
    ) {
      state.connectingLetterGuide = true;
    },
    seenAllGuide(
      state,
    ) {
      state.firstGuide = true;
      state.wordToSlotGuide = true;
      state.unknownWordGuide = true;
      state.connectingLetterGuide = true;
    },
  },
});

export const {
  changeTheme,
  changeSoundGame,
  changeMusicGame,
  changeVibrationGame,
  // ===========================================================================
  seenWordToSlotGuide,
  seenUnknownWordGuide,
  seenConnectingLetterGuide,
  seenAllGuide
} = settingSlice.actions;

export default settingSlice.reducer;