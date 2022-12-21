import { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSeenUser } from "../../redux/apiRequest/mongoRequest";
import { RoomContext } from "../../utils/roomContext";

const Content = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const { initRoomDetails } = useContext(RoomContext);
  const dispatch = useDispatch();

  const room = useSelector((state) => state.room?.room);

  const [listMessage, setListMessage] = useState([]);

  const { roomDetails } = useContext(RoomContext);
  const { receiveMessage } = useContext(RoomContext);

  useEffect(() => {
    setListMessage(roomDetails?.messagesIds.reverse() || []);
  }, [roomDetails]);

  // loc ra nhan tu server toi room hien tai
  useEffect(() => {
    if (receiveMessage.room === room) {
      const newMessage = {
        userId: {
          _id: receiveMessage.senderId,
          avatarUrl: receiveMessage.avatarUrl,
          username: receiveMessage.sender,
        },
        content: receiveMessage.message,
      };
      setListMessage((prev) => {
        if (prev) {
          return [...prev, newMessage];
        } else {
          return [newMessage];
        }
      });
      addSeenUser(
        {
          roomId: room.roomId,
          seenUserId: currentUser._id,
          seenUser: currentUser.username,
        },
        dispatch
      );
    }
  }, [receiveMessage]);

  // scroll to bottom
  const divRef = useRef(null);
  useEffect(() => {
    divRef.current.scrollIntoView({ behavior: "smooth" });
  });

  // scroll top load more messages
  const count = useRef(0);
  const divContainer = useRef(null);
  useEffect(() => {
    divContainer.current.addEventListener("scroll", (e) => {
      // su ly sau
      if (e.target.scrollTop === 0) {
        count.current += 10;
        initRoomDetails({ roomId: room, limit: count.current });
        // const
      }
    });
  }, []);

  if (roomDetails?.userIds.length === 2) {
    return (
      <div className="flex flex-col h-full overflow-x-auto mb-4">
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-12 gap-y-2">
            {listMessage?.map((message, index) => {
              if (message.userId._id === currentUser._id) {
                return (
                  <div className="col-start-6 col-end-13 p-3 rounded-lg" key={index}>
                    <div className="flex items-center justify-start flex-row-reverse">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500 flex-shrink-0">
                        <img src={message.userId.avatarUrl} alt="avt" />
                      </div>
                      <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                        <div>{message.content}</div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="col-start-1 col-end-8 p-3 rounded-lg" key={index}>
                    <div className="flex flex-row items-center">
                      <div className="h-8 w-8 rounded-full border overflow-hidden">
                        <img src={message.userId.avatarUrl} alt="avt" />
                      </div>
                      <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                        <div>{message.content}</div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
            <div ref={divRef}> </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col h-full overflow-x-auto mb-4" ref={divContainer}>
        <div className="flex flex-col h-full">
          <div className="grid grid-cols-12 gap-y-2">
            {listMessage?.map((message, index) => {
              if (message.userId._id === currentUser._id) {
                return (
                  <div className="col-start-6 col-end-13 p-3 rounded-lg" key={index}>
                    <div className="flex items-center justify-start flex-row-reverse">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500 flex-shrink-0">
                        <img src={message.userId.avatarUrl} alt="avt" />
                      </div>
                      <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                        <div>{message.content}</div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="col-start-1 col-end-8 p-3 rounded-lg" key={index}>
                    <div className="flex flex-row items-center">
                      <div className="h-8 w-8 rounded-full border overflow-hidden">
                        <img src={message.userId.avatarUrl} alt="avt" />
                      </div>
                      <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                        <div>
                          <font color="blue">{`${message.userId.username}`}</font>
                          {`: ${message.content}`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
            <div ref={divRef}> </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Content;
