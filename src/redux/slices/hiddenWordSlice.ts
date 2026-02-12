import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HiddenWordState {
  totalHiddenWords: number;
  newHiddenWords: number;
}

const initialState: HiddenWordState = {
  totalHiddenWords: 0,
  newHiddenWords: 0
};

const hiddenWordSlice = createSlice({
  name: 'hiddenWords',
  initialState,
  reducers: {
    updateNumberHiddenWords(
      state,
      action: PayloadAction<{ totalHiddenWords: number, newHiddenWords: number }>
    ) {
      state.totalHiddenWords = action.payload.totalHiddenWords;
      state.newHiddenWords = action.payload.newHiddenWords;
    },
    findingOneNewHiddenWord(
      state,
    ) {
      state.totalHiddenWords = state.totalHiddenWords+1;
      state.newHiddenWords = state.newHiddenWords+1;
    },
    convertHiddenWordsToCoin(
      state,
    ) {
      state.newHiddenWords = 0;
    },
  },
});

export const { updateNumberHiddenWords, findingOneNewHiddenWord, convertHiddenWordsToCoin } = hiddenWordSlice.actions;

export default hiddenWordSlice.reducer;