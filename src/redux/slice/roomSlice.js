import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listRoomContact: null,
  room: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setListRoom: (state, action) => {
      state.listRoomContact = action.payload;
    },
    setRoom: (state, action) => {
      state.room = action.payload;
    },
    addMessToContact: (state, action) => {
      const message = action.payload;
      state.listRoomContact.forEach((room) => {
        if (room.roomId === message.roomId) {
          room.finalMessage.sender = message.sender;
          room.finalMessage.content = message.content;
          room.finalMessage.createAt = message.createAt;
          room.seenUsers = [message.sender];
        }
      });
    },
    addSeenUserToListRoom: (state, action) => {
      const data = action.payload;
      state.listRoomContact.forEach((room) => {
        if (room.roomId === data.roomId) {
          room.seenUsers.push(data.seenUser);
        }
      });
    },
  },
});

export const { setListRoom, setRoom, addMessToContact, addSeenUserToListRoom } = roomSlice.actions;

export default roomSlice.reducer;
