import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StageGameState {
  versionCreatedContent: number;
  versionUpdatedContent: number;
  versionDeletedContent: number;
  forceUpdate: boolean;
  stageGameLanguage: string | null;
}

const initialState: StageGameState = {
  versionCreatedContent: 0,
  versionUpdatedContent: 0,
  versionDeletedContent: 0,
  forceUpdate: false,
  stageGameLanguage: null,
};

const stageGamePersistSlice = createSlice({
  name: 'stageGamePersist',
  initialState,
  reducers: {
    changeStageGameLanguage(state, action: PayloadAction<{ language: string }>) {
      state.stageGameLanguage = action.payload.language
    },
    changeVersionContent(state, action: PayloadAction<{ versionCreatedContent: number; versionUpdatedContent: number; versionDeletedContent: number; }>) {
      state.versionCreatedContent = action.payload.versionCreatedContent;
      state.versionUpdatedContent = action.payload.versionUpdatedContent;
      state.versionDeletedContent = action.payload.versionDeletedContent;
      state.forceUpdate = false;
    },
    changeStageGameForceUpdate(state, action: PayloadAction<{ forceUpdate: boolean }>) {
      state.forceUpdate = action.payload.forceUpdate;
    },
  },
});

export const { 
  changeStageGameLanguage,
  changeVersionContent,
  changeStageGameForceUpdate
} = stageGamePersistSlice.actions;

export default stageGamePersistSlice.reducer;