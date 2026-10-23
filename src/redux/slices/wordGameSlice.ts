import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WordGameState {
  lastStage: string | null;
  lastStageNumber: number | null;
  lastSeason: string | null;
  lastSeasonNumber: number | null;
}

const initialState: WordGameState = {
  lastStage: null,
  lastStageNumber: 1,
  lastSeason: null,
  lastSeasonNumber: 1,
};

const wordGameSlice = createSlice({
  name: 'wordGame',
  initialState,
  reducers: {
    updateWordGameCurrentLanguageLastStageAndLastSeason(state, action: PayloadAction<{ lastStage: string; lastStageNumber: number; lastSeason: string; lastSeasonNumber: number }>) {
      state.lastStage = action.payload.lastStage;
      state.lastStageNumber = action.payload.lastStageNumber;
      state.lastSeason = action.payload.lastSeason;
      state.lastSeasonNumber = action.payload.lastSeasonNumber;
    },
  },
});

export const {
  updateWordGameCurrentLanguageLastStageAndLastSeason,
} = wordGameSlice.actions;

export default wordGameSlice.reducer;