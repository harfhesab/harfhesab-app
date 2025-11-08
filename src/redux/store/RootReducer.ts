import { combineReducers } from "@reduxjs/toolkit";
import accountReducer from "../slices/accountSlice";
import settingReducer from "../slices/settingSlice";
import mainReducer from "../slices/mainSlice";
import stageGameReducer from "../slices/stageGameSlice";
import stageGamePersistReducer from "../slices/stageGamePersistSlice";
import stageGameDownloadReducer from "../slices/stageGameDownloadSlice";
import coinReducer from "../slices/coinSlice";
import subscriptionReducer from "../slices/subscriptionSlice";
import constantsReducer from "../slices/constantsSlice";
import packageGameDownloadReducer from "../slices/packageGameDownloadSlice";

const appReducer = combineReducers({
  account: accountReducer,
  setting: settingReducer,
  main: mainReducer,
  stageGame: stageGameReducer,
  stageGamePersist: stageGamePersistReducer,
  stageGameDownload: stageGameDownloadReducer,
  packageGameDownload: packageGameDownloadReducer,
  coins: coinReducer,
  subscription: subscriptionReducer,
  constants: constantsReducer,
});

export type RootState = ReturnType<typeof appReducer>;

const rootReducer = (state: RootState | undefined, action: any) => {
  if (action.type === "RESET_APP") {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
