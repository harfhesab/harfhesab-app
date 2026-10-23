import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WordGameState {
  versionCreatedContent: number;
  versionUpdatedContent: number;
  versionDeletedContent: number;
  forceUpdate: boolean;
  wordGameLanguage: string | null;
  wordGameLanguageName: string | null;
}

const initialState: WordGameState = {
  versionCreatedContent: 0,
  versionUpdatedContent: 0,
  versionDeletedContent: 0,
  forceUpdate: false,
  wordGameLanguage: null,
  wordGameLanguageName: null,
};

const wordGamePersistSlice = createSlice({
  name: 'wordGamePersist',
  initialState,
  reducers: {
    changeWordGameLanguage(state, action: PayloadAction<{ language: string; languageName: string; }>) {
      state.wordGameLanguage = action.payload.language;
      state.wordGameLanguageName = action.payload.languageName;
    },
    changeVersionContent(state, action: PayloadAction<{ versionCreatedContent: number; versionUpdatedContent: number; versionDeletedContent: number; }>) {
      state.versionCreatedContent = action.payload.versionCreatedContent;
      state.versionUpdatedContent = action.payload.versionUpdatedContent;
      state.versionDeletedContent = action.payload.versionDeletedContent;
      state.forceUpdate = false;
    },
    changeWordGameForceUpdate(state, action: PayloadAction<{ forceUpdate: boolean }>) {
      state.forceUpdate = action.payload.forceUpdate;
    },
  },
});

export const { 
  changeWordGameLanguage,
  changeVersionContent,
  changeWordGameForceUpdate
} = wordGamePersistSlice.actions;

export default wordGamePersistSlice.reducer;