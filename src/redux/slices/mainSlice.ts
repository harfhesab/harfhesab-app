import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MainState {
  splash: boolean;
  onboarded: boolean;
}

const initialState: MainState = {
  splash: true,
  onboarded : true
};

const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    hideSplash(
      state,
    ) {
      state.splash = false;
    },
    showSplash(
      state,
    ) {
      state.splash = true;
    },
    changeOnboarding(
      state,
    ) {
      state.onboarded = false;
    },
  },
});

export const { hideSplash, showSplash, changeOnboarding } = mainSlice.actions;

export default mainSlice.reducer;