import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AccountState {
  isLoggedIn: boolean;
  token: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
}

const initialState: AccountState = {
  isLoggedIn: false,
  token: null,
  phone: null,
  firstName: null,
  lastName: null,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{ token: string, phone: string, firstName: string | null; lastName: string | null; }>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.phone = action.payload.phone;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.phone = null;
      state.firstName = null;
      state.lastName = null;
    },
  },
});

export const { login, logout } = accountSlice.actions;

export default accountSlice.reducer;