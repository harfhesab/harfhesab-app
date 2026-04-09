import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AccountState {
  isLoggedIn: boolean;
  loginType: "registered" | "guest" | null; 
  token: string | null;
  phone: string | null;
  name: string | null;
  syncUserPackage: string | null;
  newNotifications : number | null;
}

const initialState: AccountState = {
  isLoggedIn: false,
  loginType: null,
  token: null,
  phone: null,
  name: null,
  syncUserPackage: null,
  newNotifications: 0,
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
      action: PayloadAction<{ token: string, phone: string, name: string | null; newNotifications: number | null}>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.phone = action.payload.phone;
      state.name = action.payload.name;
      state.newNotifications = action.payload.newNotifications;
      state.loginType = "registered";
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.phone = null;
      state.name = null;
      state.loginType = null;
      state.syncUserPackage = null;
      state.newNotifications = 0;
    },
    convertGuestToRegistered(
      state,
      action: PayloadAction<{ phone: string; name: string | null; newNotifications: number | null }>
    ) {
      state.isLoggedIn = true;
      state.phone = action.payload.phone;
      if (typeof action.payload.name === 'string') {
        state.name = action.payload.name;
      }
      state.loginType = "registered";
      state.newNotifications = action.payload.newNotifications;
    },
    updateSyncUserPackage(
      state,
      action: PayloadAction<{ sync: string | null}>
    ) {
      state.syncUserPackage = action.payload.sync;
    },
    changeName(
      state,
      action: PayloadAction<{ name: string | null; }>
    ) {
      state.name = action.payload.name;
    },
    changeNewNotifications(
      state,
      action: PayloadAction<{ number: number | null }>
    ) {
      state.newNotifications = action.payload.number;
    },
  },
});

export const { login, logout, loginAsGuest, convertGuestToRegistered, updateSyncUserPackage, changeName, changeNewNotifications } = accountSlice.actions;

export default accountSlice.reducer;