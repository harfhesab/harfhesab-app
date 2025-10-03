import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SubscriptionState {
  activeSubscription : boolean;
  subscriptionExpiration : Date | null;
  subscriptionPlansVersion: number;
}

const initialState: SubscriptionState = {
  activeSubscription : false,
  subscriptionExpiration : null,
  subscriptionPlansVersion: 0
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    updateSubscriptionStatus(
      state,
      action: PayloadAction<{ activeSubscription: boolean, subscriptionExpiration: Date | null }>
    ) {
      state.activeSubscription = action.payload.activeSubscription;
      state.subscriptionExpiration = action.payload.subscriptionExpiration;
    },
    changeSubscriptionPlansVersion(
      state,
      action: PayloadAction<{ version: number }>
    ) {
      state.subscriptionPlansVersion = action.payload.version;
    },
  },
});

export const { updateSubscriptionStatus, changeSubscriptionPlansVersion } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;