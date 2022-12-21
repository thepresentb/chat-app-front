import React from "react";
import Contact from "./Contact";
import Message from "./Message";
import { useEffect } from "react";
import { initSocket } from "../../redux/slice/socketSlice";
import { useDispatch, useSelector } from "react-redux";

const Chat = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const dispatch = useDispatch();
  dispatch(initSocket());
  const socket = useSelector((state) => state.socket.socket);

  useEffect(() => {
    if (currentUser) {
      socket.emit("joinRoom", { userId: currentUser._id, roomIds: currentUser.roomIds });
    }
  }, []);

  return (
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        <Contact />
        <Message />
      </div>
    </div>
  );
};

export default Chat;
