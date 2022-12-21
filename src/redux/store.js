import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slice/authSlice";
import roomSlice from "./slice/roomSlice";
import socketSlice from "./slice/socketSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    room: roomSlice,
    socket: socketSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
