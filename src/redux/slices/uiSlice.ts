import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  theme: string;
}

const initialState: AuthState = {
  theme: "t1",
};

const authSlice = createSlice({
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

export const { changeTheme } = authSlice.actions;

export default authSlice.reducer;