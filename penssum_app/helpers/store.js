import ExpoFileSystemStorage from "redux-persist-expo-filesystem"; // Save unlimited information
import { persistStore, persistReducer } from "redux-persist"; // Save unlimited information
import { configureStore, combineReducers } from "@reduxjs/toolkit";

//reducer user

import userSlice from "./features/user/userSlice";
import contactsSlice from "./features/user/contactsSlice";
import notificationsSlice from "./features/user/notificationsSlice";

// reducer post

import postSlice from "./features/post/postSlice";

// reducer helpers

import usersSlice from "./features/helpers/usersSlice";

const reducers = combineReducers({
  user: userSlice,
  users: usersSlice,
  post: postSlice,
  contacts: contactsSlice,
  notifications: notificationsSlice,
});

const persistConfig = {
  // redux persist settings
  key: "root", // key
  version: 1, // version
  storage: ExpoFileSystemStorage, // storage
};

const persistedReducer = persistReducer(persistConfig, reducers); // Combine adjustments and reducers

export const store = configureStore({
  // Create store
  reducer: persistedReducer, // the adjustments
  middleware: (
    getDefaultMiddleware // additional middleware for redux to persist works
  ) =>
    getDefaultMiddleware({
      immutableCheck: {
        // Ignore state paths, e.g. state for 'items':
        ignoredPaths: ["items.data"],
      },
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store); // export store
