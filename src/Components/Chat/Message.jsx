import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessToContact } from "../../redux/slice/roomSlice";
import { RoomContext } from "../../utils/roomContext";
import Content from "./Content";
import InfoContact from "./InfoContact";
import Input from "./Input";

const Message = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const room = useSelector((state) => state.room.room);
  const socket = useSelector((state) => state.socket?.socket);
  const { setReceiveMessage } = useContext(RoomContext);

  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setReceiveMessage(data);
      const finalMessage = {
        roomId: data.room,
        sender: data.sender,
        content: data.message,
        createAt: data.createAt,
      };
      dispatch(addMessToContact(finalMessage));
    });
  }, [currentUser]);

  return (
    <div className="flex flex-col flex-auto h-full p-6">
      {room ? (
        <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
          <InfoContact />
          <Content />
          <Input />
        </div>
      ) : (
        <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4 text-xl font-semibold items-center justify-center">
          <div className="flex text-center">
            <p>Hãy chọn một đoạn chat hoặc bắt đầu cuộc trò chuyện mới</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
