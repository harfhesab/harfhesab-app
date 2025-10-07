import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AccountState {
  isLoggedIn: boolean;
  loginType: "registered" | "guest" | null; 
  token: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
}

const initialState: AccountState = {
  isLoggedIn: false,
  loginType: null,
  token: null,
  phone: null,
  firstName: null,
  lastName: null,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    loginAsGuest(
      state,
      action: PayloadAction<{ token: string; }>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.loginType = "guest";
    },
    login(
      state,
      action: PayloadAction<{ token: string, phone: string, firstName: string | null; lastName: string | null; }>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.phone = action.payload.phone;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.loginType = "registered";
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.phone = null;
      state.firstName = null;
      state.lastName = null;
      state.loginType = null;
    },
    convertGuestToRegistered(
      state,
      action: PayloadAction<{ phone: string, firstName: string | null; lastName: string | null; }>
    ) {
      state.isLoggedIn = true;
      state.phone = action.payload.phone;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.loginType = "registered";
    },
  },
});

export const { login, logout, loginAsGuest, convertGuestToRegistered } = accountSlice.actions;

export default accountSlice.reducer;