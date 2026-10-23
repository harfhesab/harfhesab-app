import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import rootReducer, { RootState as ReducerState } from "./RootReducer";

const persistConfig: PersistConfig<ReducerState> = {
  key: "root",
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  whitelist: ["account", "setting", "stageGamePersist", "wordGamePersist", "coins", "constants", "subscription", "hiddenWords"],
  blacklist: ["stageGameDownload", "stageGame", "wordGameDownload", "wordGame", "main", "packageGameDownload"],
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