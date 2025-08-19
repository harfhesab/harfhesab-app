import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StageGameState {
  lastStage: string | null;
  lastStageNumber: number | null;
  lastSeason: string | null;
  lastSeasonNumber: number | null;
}

const initialState: StageGameState = {
  lastStage: null,
  lastStageNumber: 1,
  lastSeason: null,
  lastSeasonNumber: 1,
};

const stageGameSlice = createSlice({
  name: 'stageGame',
  initialState,
  reducers: {
    updateCurrentLanguageLastStageAndLastSeason(state, action: PayloadAction<{ lastStage: string; lastStageNumber: number; lastSeason: string; lastSeasonNumber: number }>) {
      state.lastStage = action.payload.lastStage;
      state.lastStageNumber = action.payload.lastStageNumber;
      state.lastSeason = action.payload.lastSeason;
      state.lastSeasonNumber = action.payload.lastSeasonNumber;
    },
  },
});

export const { 
  updateCurrentLanguageLastStageAndLastSeason,
} = stageGameSlice.actions;

export default stageGameSlice.reducer;