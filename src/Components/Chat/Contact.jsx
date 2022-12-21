import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSeenUser, createRoomSearched, getListRoom, getListUserSearched } from "../../redux/apiRequest/mongoRequest";
import { initListRoom } from "../../redux/apiRequest/roomRequest";
import { setRoom } from "../../redux/slice/roomSlice";
import { RoomContext } from "../../utils/roomContext";

const Contact = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const socket = useSelector((state) => state.socket?.socket);
  const listRoom = useSelector((state) => state.room?.listRoomContact) || [];
  const { initRoomDetails } = useContext(RoomContext);
  const { setChattingUser } = useContext(RoomContext);
  const [isSearching, setIsSearching] = useState(false);
  const [listSearchingUsers, setListSearchingUsers] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser) {
      initListRoom(currentUser?._id, dispatch);
      socket.on("newContact", async (roomId) => {
        const userInfo = await getListRoom(currentUser?._id);
        if (userInfo.roomIds.includes(roomId)) {
          initListRoom(currentUser?._id, dispatch);
          socket.emit("joinOneRoom", currentUser._id, roomId);
        }
      });
    }
  }, []);

  const refreshPage = () => {
    window.location.reload(false);
  };
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    refreshPage();
  };

  const handleClickContact = (room) => {
    if (!room.seenUsers.includes(currentUser.username)) {
      addSeenUser(
        {
          roomId: room.roomId,
          seenUserId: currentUser._id,
          seenUser: currentUser.username,
        },
        dispatch
      );
    }
    initRoomDetails({ roomId: room.roomId });
    setChattingUser(room.roomMembers);
    dispatch(setRoom(room.roomId));
  };

  const handleInput = async (e) => {
    if (e.target.value) {
      const listUserSearched = await getListUserSearched(e.target.value);
      if (listUserSearched?.statusbar === "error") {
        return setListSearchingUsers([]);
      }
      setListSearchingUsers(listUserSearched.filter((user) => user._id !== currentUser._id));
    }
  };

  const handleClickToUserSearch = async (userId) => {
    const data = [currentUser._id, userId];
    const roomInfo = await createRoomSearched(data);
    initRoomDetails(roomInfo._id);
    setChattingUser(roomInfo.userIds);
    dispatch(setRoom(roomInfo._id));
    socket.emit("joinOneRoom", currentUser._id, roomInfo._id);
    socket.emit("reloadContact", roomInfo._id);
  };

  return (
    <div className="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
      <div className="flex flex-row items-center justify-center h-12 w-full">
        <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            ></path>
          </svg>
        </div>
        <div className="ml-2 font-bold text-2xl">Present</div>
      </div>

      {/* khung tim kiem */}
      <div className="flex justify-center mt-10">
        <div
          className={`${!isSearching && "hidden"} w-[46px] opacity-50 mr-1`}
          onClick={() => {
            setIsSearching(false);
          }}
        >
          <svg className="svg-icon" viewBox="0 0 20 20">
            <path d="M11.739,13.962c-0.087,0.086-0.199,0.131-0.312,0.131c-0.112,0-0.226-0.045-0.312-0.131l-3.738-3.736c-0.173-0.173-0.173-0.454,0-0.626l3.559-3.562c0.173-0.175,0.454-0.173,0.626,0c0.173,0.172,0.173,0.451,0,0.624l-3.248,3.25l3.425,3.426C11.911,13.511,11.911,13.789,11.739,13.962 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.148,3.374,7.521,7.521,7.521C14.147,17.521,17.521,14.148,17.521,10"></path>
          </svg>
        </div>
        <div className="mb-3 xl:w-100 w-full">
          <input
            type="search"
            onFocus={() => setIsSearching(true)}
            onChange={(e) => handleInput(e)}
            className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded-2xl transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            id="exampleSearch"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* khung liet ke list danh sach tim kiem */}
      {isSearching ? (
        <div className="flex flex-col mt-4 grow">
          <div className="flex flex-col mt-4 overflow-y-auto grow">
            {listSearchingUsers?.map((userInfo, index) => {
              return (
                <button
                  className={`flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 `}
                  key={index}
                  onClick={() => handleClickToUserSearch(userInfo._id)}
                >
                  <div className="contents border overflow-hidden">
                    <img src={userInfo.avatarUrl} alt="avt" className="h-8 w-8 object-cover mr-1" />
                  </div>
                  <div className="flex flex-col items-start ml-2 text-md font-semibold">
                    <div className="">{userInfo.username}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // khung contact
        <div className="flex flex-col mt-4 grow h-[400px]">
          <div className="flex flex-row items-center justify-between text-xs">
            <span className="font-bold">Active Conversations</span>
            <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">
              {listRoom?.length}
            </span>
          </div>
          <div className="flex flex-col mt-4 overflow-y-auto grow">
            {listRoom?.map((room, index) => {
              // neu room 2 nguoi
              if (room.roomMembers.length === 2) {
                // loc ra thanh vien trong room khong phai crr user
                const filterMember = room.roomMembers.filter((member) => member.username !== currentUser?.username);
                // render giao dien da xem
                if (room.seenUsers.includes(currentUser.username)) {
                  return (
                    <button
                      className={`flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 opacity-50 order-last
                    `}
                      key={index}
                      onClick={() => handleClickContact(room)}
                    >
                      <div className="contents border overflow-hidden">
                        <img src={filterMember[0].avatarUrl} alt="avt" className="h-8 w-8 object-cover mr-1" />
                      </div>
                      <div className="flex flex-col items-start ml-2 text-md font-semibold">
                        <div className="">{filterMember[0].username}</div>
                        <div className={`text-xs flex w-[130px] font-light                       `}>
                          <p
                            style={{
                              overflow: "hidden",
                              display: "-webkit-box",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              // WebkitBoxOrient: "vertical",
                              // WebkitLineClamp: "1",
                              // whiteSpace: "nowrap",
                            }}
                          >
                            {room.finalMessage.sender === currentUser?.username && "Bạn:"}
                            {room.finalMessage.content}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                }
                // render giao dien chua xem
                else {
                  return (
                    <button
                      className={`flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 `}
                      key={index}
                      onClick={() => handleClickContact(room)}
                    >
                      <div className="contents border overflow-hidden">
                        <img src={filterMember[0].avatarUrl} alt="avt" className="h-8 w-8 object-cover mr-1" />
                      </div>
                      <div className="flex flex-col items-start ml-2 text-md font-semibold">
                        <div className="">{filterMember[0].username}</div>
                        <div className={`text-xs flex w-[130px] text-blue-500 text-xs                        `}>
                          <p
                            style={{
                              overflow: "hidden",
                              display: "-webkit-box",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              // WebkitBoxOrient: "vertical",
                              // WebkitLineClamp: "1",
                              // whiteSpace: "nowrap",
                            }}
                          >
                            {room.finalMessage.sender === currentUser?.username && "Bạn:"}
                            {room.finalMessage.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center ml-auto  bg-blue-500 h-2 w-2 rounded leading-none"></div>
                    </button>
                  );
                }
              }

              // khi room co nhieu hon 2 nguoi ( gruop)
              if (room.roomMembers.length >= 2) {
                // loc ra thanh vien trong room khong phai crr user
                const filterMember = room.roomMembers.filter((member) => member.username !== currentUser?.username);
                const listNameMembers = `${filterMember[0].username}, ${filterMember[1].username}, ...`;
                // giao dien da xem
                if (room.seenUsers.includes(currentUser.username)) {
                  return (
                    <button
                      className={`flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 opacity-50 order-last`}
                      key={index}
                      onClick={() => handleClickContact(room)}
                    >
                      <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-8 w-8 mr-1 cursor-pointer">
                        <svg className="svg-icon" viewBox="0 0 20 20">
                          <path d="M15.573,11.624c0.568-0.478,0.947-1.219,0.947-2.019c0-1.37-1.108-2.569-2.371-2.569s-2.371,1.2-2.371,2.569c0,0.8,0.379,1.542,0.946,2.019c-0.253,0.089-0.496,0.2-0.728,0.332c-0.743-0.898-1.745-1.573-2.891-1.911c0.877-0.61,1.486-1.666,1.486-2.812c0-1.79-1.479-3.359-3.162-3.359S4.269,5.443,4.269,7.233c0,1.146,0.608,2.202,1.486,2.812c-2.454,0.725-4.252,2.998-4.252,5.685c0,0.218,0.178,0.396,0.395,0.396h16.203c0.218,0,0.396-0.178,0.396-0.396C18.497,13.831,17.273,12.216,15.573,11.624 M12.568,9.605c0-0.822,0.689-1.779,1.581-1.779s1.58,0.957,1.58,1.779s-0.688,1.779-1.58,1.779S12.568,10.427,12.568,9.605 M5.06,7.233c0-1.213,1.014-2.569,2.371-2.569c1.358,0,2.371,1.355,2.371,2.569S8.789,9.802,7.431,9.802C6.073,9.802,5.06,8.447,5.06,7.233 M2.309,15.335c0.202-2.649,2.423-4.742,5.122-4.742s4.921,2.093,5.122,4.742H2.309z M13.346,15.335c-0.067-0.997-0.382-1.928-0.882-2.732c0.502-0.271,1.075-0.429,1.686-0.429c1.828,0,3.338,1.385,3.535,3.161H13.346z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col items-start ml-2 text-md font-semibold">
                        <div className="">{listNameMembers}</div>
                        <div className={`text-xs flex w-[130px] font-light`}>
                          <p
                            style={{
                              overflow: "hidden",
                              display: "-webkit-box",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              // WebkitBoxOrient: "vertical",
                              // WebkitLineClamp: "1",
                              // whiteSpace: "nowrap",
                            }}
                          >
                            {room.finalMessage.sender === currentUser?.username && "Bạn:"}
                            {room.finalMessage.content}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                } else {
                  return (
                    <button
                      className={`flex flex-row items-center hover:bg-gray-100 rounded-xl p-2 `}
                      key={index}
                      onClick={() => handleClickContact(room)}
                    >
                      <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-8 w-8 mr-1 cursor-pointer">
                        <svg className="svg-icon" viewBox="0 0 20 20">
                          <path d="M15.573,11.624c0.568-0.478,0.947-1.219,0.947-2.019c0-1.37-1.108-2.569-2.371-2.569s-2.371,1.2-2.371,2.569c0,0.8,0.379,1.542,0.946,2.019c-0.253,0.089-0.496,0.2-0.728,0.332c-0.743-0.898-1.745-1.573-2.891-1.911c0.877-0.61,1.486-1.666,1.486-2.812c0-1.79-1.479-3.359-3.162-3.359S4.269,5.443,4.269,7.233c0,1.146,0.608,2.202,1.486,2.812c-2.454,0.725-4.252,2.998-4.252,5.685c0,0.218,0.178,0.396,0.395,0.396h16.203c0.218,0,0.396-0.178,0.396-0.396C18.497,13.831,17.273,12.216,15.573,11.624 M12.568,9.605c0-0.822,0.689-1.779,1.581-1.779s1.58,0.957,1.58,1.779s-0.688,1.779-1.58,1.779S12.568,10.427,12.568,9.605 M5.06,7.233c0-1.213,1.014-2.569,2.371-2.569c1.358,0,2.371,1.355,2.371,2.569S8.789,9.802,7.431,9.802C6.073,9.802,5.06,8.447,5.06,7.233 M2.309,15.335c0.202-2.649,2.423-4.742,5.122-4.742s4.921,2.093,5.122,4.742H2.309z M13.346,15.335c-0.067-0.997-0.382-1.928-0.882-2.732c0.502-0.271,1.075-0.429,1.686-0.429c1.828,0,3.338,1.385,3.535,3.161H13.346z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col items-start ml-2 text-md font-semibold">
                        <div className="">{listNameMembers}</div>
                        <div className={`text-xs flex w-[130px] text-blue-500 text-xs                        `}>
                          <p
                            style={{
                              overflow: "hidden",
                              display: "-webkit-box",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              // WebkitBoxOrient: "vertical",
                              // WebkitLineClamp: "1",
                              // whiteSpace: "nowrap",
                            }}
                          >
                            {room.finalMessage.sender === currentUser?.username && "Bạn:"}
                            {room.finalMessage.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center ml-auto  bg-blue-500 h-2 w-2 rounded leading-none"></div>
                    </button>
                  );
                }
              }
            })}
          </div>
        </div>
      )}
      <div className="flex flex-col mt-4">
        <div className="flex flex-row items-center justify-around bg-green-100 rounded-xl p-2">
          <div className="flex items-center justify-center h-14 w-10 bg-indigo-200 rounded-full">
            <img src={currentUser.avatarUrl} alt="avt" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="ml-2 text-lg font-semibold">{currentUser.username}</div>
            <button className="ml-2 text-sm font-semibold opacity-50 hover:opacity-75" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
