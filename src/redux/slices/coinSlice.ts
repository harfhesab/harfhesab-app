import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CoinState {
  numberCoins: number;
}

const initialState: CoinState = {
  numberCoins: 100,
};

const coinSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    updateNumberCoins(
      state,
      action: PayloadAction<{ number: number }>
    ) {
      state.numberCoins = action.payload.number;
    },
    reduceNumberCoins(
      state,
      action: PayloadAction<{ number: number }>
    ) {
      state.numberCoins = state.numberCoins - action.payload.number;
    },
    increaseNumberCoins(
      state,
      action: PayloadAction<{ number: number }>
    ) {
      state.numberCoins = state.numberCoins + action.payload.number;
    },
  },
});

export const { updateNumberCoins, reduceNumberCoins, increaseNumberCoins } = coinSlice.actions;

export default coinSlice.reducer;