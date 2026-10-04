import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: string;
  sound: boolean;
  music: boolean;
  vibration: boolean;
  // ====================================================================
  // ====================================================================
  wordToSlotGuide: boolean;
  unknownWordGuide: boolean;
  connectingLetterGuide: boolean;
  // ====================================================================
  // ====================================================================
  continueGameType?: "stage-game" | "package-game" | "harf-akhar" | null;
  continueGameLanguageId?: string | null;
  continueGameLanguageName?: string | null;
  continueGameSeasonId?: string | null;
  continueGameSeasonName?: string | null;
  continueGameId?: string | null;
  continueGameName?: string | null;
  continueGamePackageId?: string | null;
  continueGamePackageName?: string | null;
  continueGamePackageIcon?: string | null;
  continueGameUserPackage?: string | null;
  continueGameLastStage?: string | null;
}

const initialState: UiState = {
  theme: "t1",
  sound: true,
  music: true,
  vibration: true,
  // =====================================================================
  // =====================================================================
  wordToSlotGuide: false,
  unknownWordGuide: false,
  connectingLetterGuide: false,
  // =====================================================================
  // =====================================================================
  continueGameType: null,
  continueGameSeasonId: null,
  continueGameSeasonName: null,
  continueGameId: null,
  continueGameName: null,
  continueGamePackageId: null,
  continueGamePackageName: null,
  continueGamePackageIcon: null,
  continueGameUserPackage: null,
  continueGameLastStage: null,
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
    seenWordToSlotGuide(
      state,
    ) {
      state.wordToSlotGuide = true;
    },
    seenUnknownWordGuide(
      state,
    ) {
      state.wordToSlotGuide = true;
      state.unknownWordGuide = true;
    },
    seenConnectingLetterGuide(
      state,
    ) {
      state.wordToSlotGuide = true;
      state.unknownWordGuide = true;
      state.connectingLetterGuide = true;
    },
    seenAllGuide(
      state,
    ) {
      state.wordToSlotGuide = true;
      state.unknownWordGuide = true;
      state.connectingLetterGuide = true;
    },
    // =====================================================================
    // =====================================================================
    updateContinueGameInStageGame(
      state,
      action: PayloadAction<{
        continueGameLanguageId: string,
        continueGameLanguageName: string,
        continueGameSeasonId: string,
        continueGameSeasonName: string,
        continueGameId : string,
        continueGameName : string,
      }>
    ) {
      state.continueGameType = "stage-game";
      state.continueGameLanguageId = action.payload.continueGameLanguageId;
      state.continueGameLanguageName = action.payload.continueGameLanguageName;
      state.continueGameSeasonId = action.payload.continueGameSeasonId;
      state.continueGameSeasonName = action.payload.continueGameSeasonName;
      state.continueGameId = action.payload.continueGameId;
      state.continueGameName = action.payload.continueGameName;
      state.continueGamePackageId = null;
      state.continueGamePackageName = null;
      state.continueGamePackageIcon = null;
      state.continueGameUserPackage = null;
      state.continueGameLastStage = null;
    },
    updateContinueGameInPackageGame(
      state,
      action: PayloadAction<{
        continueGameSeasonId: string | null,
        continueGameSeasonName: string | null,
        continueGameId : string,
        continueGameName : string,
        continueGamePackageId: string,
        continueGamePackageName: string,
        continueGamePackageIcon: string,
        continueGameUserPackage: string,
        continueGameLastStage: string,
      }>
    ) {
      state.continueGameType = "package-game";
      state.continueGameLanguageId = null;
      state.continueGameLanguageName = null;
      state.continueGameSeasonId = action.payload.continueGameSeasonId;
      state.continueGameSeasonName = action.payload.continueGameSeasonName;
      state.continueGameId = action.payload.continueGameId;
      state.continueGameName = action.payload.continueGameName;
      state.continueGamePackageId = action.payload.continueGamePackageId;
      state.continueGamePackageName = action.payload.continueGamePackageName;
      state.continueGamePackageIcon = action.payload.continueGamePackageIcon;
      state.continueGameUserPackage = action.payload.continueGameUserPackage;
      state.continueGameLastStage = action.payload.continueGameLastStage;
    },
    updateContinueGameInHarfAkhar(
      state,
      action: PayloadAction<{
        continueGameId : string,
        continueGameName : string,
      }>
    ) {
      state.continueGameType = "harf-akhar";
      state.continueGameLanguageId = null;
      state.continueGameLanguageName = null;
      state.continueGameSeasonId = null;
      state.continueGameSeasonName = null;
      state.continueGameId = action.payload.continueGameId;
      state.continueGameName = action.payload.continueGameName;
      state.continueGamePackageId = null;
      state.continueGamePackageName = null;
      state.continueGamePackageIcon = null;
      state.continueGameUserPackage = null;
      state.continueGameLastStage = null;
    },
    deleteContinueGame(
      state,
    ) {
      state.continueGameType = null;
      state.continueGameSeasonId = null;
      state.continueGameSeasonName = null;
      state.continueGameId = null;
      state.continueGameName = null;
      state.continueGamePackageId = null;
      state.continueGamePackageName = null;
      state.continueGamePackageIcon = null;
      state.continueGameUserPackage = null;
      state.continueGameLastStage = null;
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
  seenAllGuide,
  // ===========================================================================
  updateContinueGameInStageGame,
  updateContinueGameInPackageGame,
  updateContinueGameInHarfAkhar,
  deleteContinueGame
} = settingSlice.actions;

export default settingSlice.reducer;