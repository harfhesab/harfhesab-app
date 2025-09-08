import { combineReducers } from '@reduxjs/toolkit';
import accountReducer from '../slices/accountSlice';
import uiReducer from '../slices/uiSlice';
import stageGameReducer from '../slices/stageGameSlice';
import stageGamePersistReducer from '../slices/stageGamePersistSlice';
import stageGameDownloadReducer from '../slices/stageGameDownloadSlice';
import coinReducer from '../slices/coinSlice';
import constantsReducer from '../slices/constantsSlice';

const rootReducer = combineReducers({
  account: accountReducer,
  ui: uiReducer,
  stageGame: stageGameReducer,
  stageGamePersist: stageGamePersistReducer,
  stageGameDownload: stageGameDownloadReducer,
  coins: coinReducer,
  constants: constantsReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
