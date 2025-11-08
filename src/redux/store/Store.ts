import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import rootReducer from "./RootReducer";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["account", "setting", "stageGamePersist", "coins", "constants", "subscription"],
  blacklist: ["stageGameDownload", "stageGame", "main", "packageGameDownload"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
