import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import uiReducer from '../slices/uiSlice';
import stageGameReducer from '../slices/stageGameSlice';
import stageGamePersistReducer from '../slices/stageGamePersistSlice';
import stageGameDownloadReducer from '../slices/stageGameDownloadSlice';
import coinReducer from '../slices/coinSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  stageGame: stageGameReducer,
  stageGamePersist: stageGamePersistReducer,
  stageGameDownload: stageGameDownloadReducer,
  coins: coinReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
