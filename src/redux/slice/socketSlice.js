import { createSlice } from "@reduxjs/toolkit";
import io from "socket.io-client";

const initialState = {
  socket: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    initSocket: (state) => {
      state.socket = io("https://socket-sever.onrender.com", {
        transports: ["websocket"],
      });
    },
  },
});

export const { initSocket } = socketSlice.actions;

export default socketSlice.reducer;
