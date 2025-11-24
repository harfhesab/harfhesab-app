import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CoinState {
  numberCoins: number;
  coinPlansVersion: number;
}

const initialState: CoinState = {
  numberCoins: 100,
  coinPlansVersion: 0
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
      state.numberCoins = Math.max(state.numberCoins - action.payload.number, 0);
    },
    increaseNumberCoins(
      state,
      action: PayloadAction<{ number: number }>
    ) {
      state.numberCoins = state.numberCoins + action.payload.number;
    },
    changeCoinPlansVersion(
      state,
      action: PayloadAction<{ version: number }>
    ) {
      state.coinPlansVersion = action.payload.version;
    },
  },
});

export const { updateNumberCoins, reduceNumberCoins, increaseNumberCoins, changeCoinPlansVersion } = coinSlice.actions;

export default coinSlice.reducer;