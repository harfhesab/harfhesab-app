import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './RootReducer';

const store = configureStore({
  reducer: rootReducer,
});

export { store };
