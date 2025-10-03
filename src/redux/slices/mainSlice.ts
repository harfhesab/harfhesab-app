import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MainState {
  splash: boolean;
}

const initialState: MainState = {
  splash: true,
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
  },
});

export const { hideSplash, showSplash } = mainSlice.actions;

export default mainSlice.reducer;