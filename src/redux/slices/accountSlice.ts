import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AccountState {
  isLoggedIn: boolean;
  loginType: "registered" | "guest" | null; 
  token: string | null;
  phone: string | null;
  name: string | null;
  syncUserPackage: string | null;
}

const initialState: AccountState = {
  isLoggedIn: false,
  loginType: null,
  token: null,
  phone: null,
  name: null,
  syncUserPackage: null,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    loginAsGuest(
      state,
      action: PayloadAction<{ token: string; name: string | null; }>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.name = action.payload.name;
      state.loginType = "guest";
    },
    login(
      state,
      action: PayloadAction<{ token: string, phone: string, name: string | null; }>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.phone = action.payload.phone;
      state.name = action.payload.name;
      state.loginType = "registered";
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.phone = null;
      state.name = null;
      state.loginType = null;
      state.syncUserPackage = null;
    },
    convertGuestToRegistered(
      state,
      action: PayloadAction<{ phone: string, name: string | null; }>
    ) {
      state.isLoggedIn = true;
      state.phone = action.payload.phone;
      state.name = action.payload.name;
      state.loginType = "registered";
    },
    updateSyncUserPackage(
      state,
      action: PayloadAction<{ sync: string | null}>
    ) {
      state.syncUserPackage = action.payload.sync;
    },
  },
});

export const { login, logout, loginAsGuest, convertGuestToRegistered, updateSyncUserPackage } = accountSlice.actions;

export default accountSlice.reducer;