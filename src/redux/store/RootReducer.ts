import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import uiReducer from '../slices/uiSlice';
import stageGamePersistReducer from '../slices/stageGamePersistSlice';
import stageGameDownloadReducer from '../slices/stageGameDownloadSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  stageGamePersist: stageGamePersistReducer,
  stageGameDownload: stageGameDownloadReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
