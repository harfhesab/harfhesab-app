import { combineReducers } from '@reduxjs/toolkit';
import accountReducer from '../slices/accountSlice';
import uiReducer from '../slices/uiSlice';
import mainReducer from '../slices/mainSlice';
import stageGameReducer from '../slices/stageGameSlice';
import stageGamePersistReducer from '../slices/stageGamePersistSlice';
import stageGameDownloadReducer from '../slices/stageGameDownloadSlice';
import coinReducer from '../slices/coinSlice';
import subscriptionReducer from '../slices/subscriptionSlice';
import constantsReducer from '../slices/constantsSlice';
import packageGameDownloadReducer from '../slices/packageGameDownloadSlice';

const rootReducer = combineReducers({
  account: accountReducer,
  ui: uiReducer,
  main: mainReducer,
  stageGame: stageGameReducer,
  stageGamePersist: stageGamePersistReducer,
  stageGameDownload: stageGameDownloadReducer,
  packageGameDownload: packageGameDownloadReducer,
  coins: coinReducer,
  subscription: subscriptionReducer,
  constants: constantsReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
