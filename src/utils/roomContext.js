import { createContext, useState } from "react";
import axios from "axios";

const RoomContext = createContext();

function RoomProvider({ children }) {
  const [roomDetails, setRoomDetails] = useState(null);
  const [receiveMessage, setReceiveMessage] = useState({});
  const [chattingUser, setChattingUser] = useState(null);
  const initRoomDetails = async (data) => {
    const res = await axios.post(`https://chat-app-liard-zeta.vercel.app/api/rooms/getRoom`, data);
    setRoomDetails(res.data);
  };

  const store = { roomDetails, initRoomDetails, receiveMessage, setReceiveMessage, chattingUser, setChattingUser };

  return <RoomContext.Provider value={store}>{children}</RoomContext.Provider>;
}

export { RoomContext, RoomProvider };
