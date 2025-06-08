import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: string;
}

const initialState: UiState = {
  theme: "t1",
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    changeTheme(
      state,
      action: PayloadAction<{ theme: string }>
    ) {
      state.theme = action.payload.theme;
    },
  },
});

export const { changeTheme } = uiSlice.actions;

export default uiSlice.reducer;