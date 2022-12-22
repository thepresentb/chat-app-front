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
      state.socket = io(
        "http://socket-server-six.vercel.app:3001"
        // , {
        //   withCredentials: true,
        //   extraHeaders: {
        //     "my-custom-header": "present",
        //   },
        // }
      );
    },
  },
});

export const { initSocket } = socketSlice.actions;

export default socketSlice.reducer;
