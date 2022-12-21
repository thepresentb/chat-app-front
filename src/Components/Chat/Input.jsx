import { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessageToDB } from "../../redux/apiRequest/mongoRequest";
import { addMessToContact } from "../../redux/slice/roomSlice";
import { RoomContext } from "../../utils/roomContext";

const Input = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [message, setMessage] = useState("");

  const dispatch = useDispatch();

  const socket = useSelector((state) => state.socket?.socket);
  const room = useSelector((state) => state.room?.room);

  const { setReceiveMessage } = useContext(RoomContext);

  const handleSendMessage = () => {
    // gui tin nhan len sv socket
    if (message !== "") {
      const messageData = {
        room: room,
        senderId: currentUser._id,
        sender: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        message: message,
        createAt: Date.now(),
      };
      socket.emit("sendMessage", messageData);

      // day tin nhan vao khung chat
      setReceiveMessage(messageData);

      // day tin nhan vao khung contact
      const finalMessage = {
        roomId: room,
        sender: currentUser.username,
        content: message,
        createAt: messageData.createAt,
      };
      dispatch(addMessToContact(finalMessage));

      // gui tin nhan len sv mongodb
      const dataToDb = {
        userId: currentUser._id,
        roomId: room,
        content: message,
      };
      addMessageToDB(dataToDb);

      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.which === 13 || e.keyCode === 13) {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
      <div className="flex-grow ml-4">
        <div className="relative w-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
            className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
          />
        </div>
      </div>
      <div className="ml-4">
        <button
          onClick={handleSendMessage}
          className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
        >
          <span>Send</span>
          <span className="ml-2">
            <svg
              className="w-4 h-4 transform rotate-45 -mt-px"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              ></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default Input;
