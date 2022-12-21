import { useRef, useState } from "react";
import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import {
  addUserToCurrentGroup,
  createRoomGroup,
  getUserSearched,
  removeUserToCurrentGroup,
} from "../../redux/apiRequest/mongoRequest";
import { setRoom } from "../../redux/slice/roomSlice";
import { RoomContext } from "../../utils/roomContext";
import toastConfig from "../../utils/toastifyConfig";

const InfoContact = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const socket = useSelector((state) => state.socket?.socket);
  const room = useSelector((state) => state.room.room);
  const { roomDetails } = useContext(RoomContext);
  const { chattingUser } = useContext(RoomContext);
  const [status, setStatus] = useState(0);
  const [showInfoDetails, setShowInfoDetails] = useState(false);
  const [showSearchMessage, setShowSearchMessage] = useState(false);
  const [showCreateGroups, setShowCreateGroups] = useState(false);
  const [listUserAddToGroup, setListUserAddToGroup] = useState([]);
  const [isDeletingUserFromGroup, setIsDeletingUserFromGroup] = useState(false);
  const { initRoomDetails } = useContext(RoomContext);
  const { setChattingUser } = useContext(RoomContext);
  const [userInfoAddToCurrentGroup, setUserInfoAddToCurrentGroup] = useState(null);
  const dispatch = useDispatch();

  let filterChattingUser = [];
  if (chattingUser) {
    filterChattingUser = chattingUser?.filter((user) => user._id !== currentUser._id);
  }

  // if (showCreateGroups) {
  // }
  useEffect(() => {
    setListUserAddToGroup([...filterChattingUser]);
  }, [roomDetails]);

  useEffect(() => {
    setStatus(0);
    if (roomDetails) {
      // lang nghe su kien user online
      socket.on("userOnline", (userId) => {
        if (roomDetails.userIds.includes(userId)) {
          // setStatus(true);
          setStatus((prev) => prev + 1);
        }
      });

      socket.on("userOffline", (userId) => {
        if (roomDetails.userIds.includes(userId)) {
          // setStatus(false);
          setStatus((prev) => prev - 1);
        }
      });

      // kiem tra xem xem user co online ko
      const usersIdOfRoom = roomDetails.userIds.filter((userId) => userId !== currentUser._id);
      socket.emit("userStatus", usersIdOfRoom, (result) => {
        result.map((userId) => {
          if (roomDetails.userIds.includes(userId)) {
            // setStatus(true);
            setStatus((prev) => prev + 1);
          }
        });
      });
    }
  }, [roomDetails]);

  const handleClickRemoveListGroup = (userId) => {
    setListUserAddToGroup(listUserAddToGroup.filter((user) => user._id !== userId));
  };

  // xu ly khi go go tim kiem username
  const handleClickAddUserToListGroup = async (e) => {
    if (e.which === 13 || e.keyCode === 13) {
      if (e.target.value !== currentUser.username) {
        // TH ten nguoi dung them vao da nam trong danh sach
        for (let i = 0; i < listUserAddToGroup?.length; i++) {
          if (listUserAddToGroup[i].username === e.target.value) {
            return toast.error("username is already exist", toastConfig);
          }
        }

        const userSearched = await getUserSearched(e.target.value);
        if (!userSearched) {
          return toast.error("username is not exist", toastConfig);
        }
        if (userSearched?.statusbar === "error") {
          return toast.error("please try again", toastConfig);
        }
        setListUserAddToGroup((prev) => [...prev, userSearched]);
        e.target.value = "";
      } else {
        e.target.value = "";
        return toast.error("enter username other than your username", toastConfig);
      }
    }
  };

  // xu ly khi them vao group hien tai
  const handleClickAddUserToCurrentGroup = async (e) => {
    if (e.which === 13 || e.keyCode === 13) {
      if (e.target.value !== currentUser.username) {
        // TH ten nguoi dung them vao da nam trong danh sach
        for (let i = 0; i < listUserAddToGroup?.length; i++) {
          if (listUserAddToGroup[i].username === e.target.value) {
            return toast.error("username is already exist", toastConfig);
          }
        }

        const userSearched = await getUserSearched(e.target.value);
        if (!userSearched) {
          return toast.error("username is not exist", toastConfig);
        }
        if (userSearched?.statusbar === "error") {
          return toast.error("please try again", toastConfig);
        }
        setUserInfoAddToCurrentGroup(userSearched);
        setIsDeletingUserFromGroup(true);

        e.target.value = "";
      } else {
        e.target.value = "";
        return toast.error("enter username other than your username", toastConfig);
      }
    }
  };

  // xu ly khi click btn create
  const handleClickCreateGroupButton = async () => {
    const dataSendToSv = [];
    dataSendToSv.push(currentUser._id);
    listUserAddToGroup.map((user) => {
      dataSendToSv.push(user._id);
    });
    const roomInfo = await createRoomGroup(dataSendToSv);
    initRoomDetails({ roomId: roomInfo._id });
    setChattingUser(roomInfo.userIds);
    dispatch(setRoom(roomInfo._id));
    socket.emit("reloadContact", roomInfo._id);
  };

  // xy ly tao thong tin user sap xoa
  let listDataUserConfirm = useRef([]);
  const handleClickRemoveUserFromGroup = async (_id, index) => {
    setIsDeletingUserFromGroup(true);
    const element = document.getElementById(`div-index-${index}`);
    element.classList.add("bg-red-100");
    listDataUserConfirm.current.push(_id);
    listDataUserConfirm.current.push(index);
  };

  // xu ly khi an btn cancel hanh dong
  const handleCancel = () => {
    if (listDataUserConfirm.current.length > 0) {
      const element = document.getElementById(`div-index-${listDataUserConfirm.current[1]}`);
      element.classList.remove("bg-red-100");
      listDataUserConfirm.current = [];
      setIsDeletingUserFromGroup(false);
    }
    if (userInfoAddToCurrentGroup) {
      setUserInfoAddToCurrentGroup(null);
      setIsDeletingUserFromGroup(false);
    }
  };

  // xu ky khi an btn confirm
  const handleClickConfirm = async () => {
    // confirm khi them user
    if (userInfoAddToCurrentGroup) {
      const data = {
        roomId: room,
        userId: userInfoAddToCurrentGroup._id,
      };
      await addUserToCurrentGroup(data);
      setListUserAddToGroup((prev) => [...prev, userInfoAddToCurrentGroup]);
      setUserInfoAddToCurrentGroup(null);
      setIsDeletingUserFromGroup(false);
      socket.emit("reloadContact", room);
    }
    // confirm khi xoa user khoi group
    if (listDataUserConfirm.current.length > 0) {
      const data = {
        roomId: room,
        userId: listDataUserConfirm.current[0],
      };
      await removeUserToCurrentGroup(data);
      setUserInfoAddToCurrentGroup(null);
      setIsDeletingUserFromGroup(false);
      initRoomDetails({ roomId: room });
      socket.emit("reloadContact", room);
    }
  };

  if (filterChattingUser?.length === 1) {
    return (
      <div className="flex flex-row items-center h-20 rounded-xl bg-green-200 w-full px-4">
        <ToastContainer />
        <div className="flex items-center justify-center h-12 w-10 bg-indigo-200 rounded-full">
          <img src={filterChattingUser[0].avatarUrl} alt="avt" />
        </div>
        <div className="flex flex-col items-start justify-center grow ml-2">
          <div className="ml-2 text-lg font-semibold">{filterChattingUser[0].username}</div>
          <div className="ml-2 text-sm font-semibold opacity-50 hover:opacity-75">{status ? "online" : "offline"}</div>
        </div>
        <div className="flex">
          <div
            onClick={() => {
              setShowInfoDetails(!showInfoDetails);
            }}
            className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10 ml-2 cursor-pointer"
          >
            <svg className="svg-icon h-6 w-6" viewBox="0 0 20 20">
              <path d="M10,1.529c-4.679,0-8.471,3.792-8.471,8.471c0,4.68,3.792,8.471,8.471,8.471c4.68,0,8.471-3.791,8.471-8.471C18.471,5.321,14.68,1.529,10,1.529 M10,17.579c-4.18,0-7.579-3.399-7.579-7.579S5.82,2.421,10,2.421S17.579,5.82,17.579,10S14.18,17.579,10,17.579 M14.348,10c0,0.245-0.201,0.446-0.446,0.446h-5c-0.246,0-0.446-0.201-0.446-0.446s0.2-0.446,0.446-0.446h5C14.146,9.554,14.348,9.755,14.348,10 M14.348,12.675c0,0.245-0.201,0.446-0.446,0.446h-5c-0.246,0-0.446-0.201-0.446-0.446s0.2-0.445,0.446-0.445h5C14.146,12.229,14.348,12.43,14.348,12.675 M7.394,10c0,0.245-0.2,0.446-0.446,0.446H6.099c-0.245,0-0.446-0.201-0.446-0.446s0.201-0.446,0.446-0.446h0.849C7.194,9.554,7.394,9.755,7.394,10 M7.394,12.675c0,0.245-0.2,0.446-0.446,0.446H6.099c-0.245,0-0.446-0.201-0.446-0.446s0.201-0.445,0.446-0.445h0.849C7.194,12.229,7.394,12.43,7.394,12.675 M14.348,7.325c0,0.246-0.201,0.446-0.446,0.446h-5c-0.246,0-0.446-0.2-0.446-0.446c0-0.245,0.2-0.446,0.446-0.446h5C14.146,6.879,14.348,7.08,14.348,7.325 M7.394,7.325c0,0.246-0.2,0.446-0.446,0.446H6.099c-0.245,0-0.446-0.2-0.446-0.446c0-0.245,0.201-0.446,0.446-0.446h0.849C7.194,6.879,7.394,7.08,7.394,7.325"></path>
            </svg>
          </div>
          <div
            className={`${
              showInfoDetails ? "flex" : "hidden"
            } absolute top-[110px] right-[40px] flex-col w-2/5 bg-white p-5 rounded-lg items-center z-10 shadow-md shadow-cyan-500/50`}
          >
            <div className="flex flex-col items-center w-full py-6 px-4 rounded-lg">
              <div className="h-20 w-20 rounded-full border overflow-hidden ">
                <img src={filterChattingUser[0].avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <div className="text-sm font-semibold mt-2">{filterChattingUser[0].username}</div>
            </div>

            {/* khung tim kiem tin nhan */}
            {/* <div className="flex flex-col w-full p-[10px] rounded-lg mb-3 cursor-pointer hover:bg-gray-100">
              <div className="flex flex-row w-full">
                <div className="grow leading-9" onClick={() => setShowSearchMessage(!showSearchMessage)}>
                  Search Messages
                </div>
                {showSearchMessage ? (
                  <div
                    className="flex items-center justify-center rounded-2xl h-8 w-8 ml-2 cursor-pointer"
                    onClick={() => setShowSearchMessage(false)}
                  >
                    <svg className="svg-icon" viewBox="0 0 20 20">
                      <path d="M13.962,8.885l-3.736,3.739c-0.086,0.086-0.201,0.13-0.314,0.13S9.686,12.71,9.6,12.624l-3.562-3.56C5.863,8.892,5.863,8.611,6.036,8.438c0.175-0.173,0.454-0.173,0.626,0l3.25,3.247l3.426-3.424c0.173-0.172,0.451-0.172,0.624,0C14.137,8.434,14.137,8.712,13.962,8.885 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.148,17.521,17.521,14.147,17.521,10"></path>
                    </svg>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-2xl h-8 w-8 ml-2 cursor-pointer"
                    onClick={() => setShowSearchMessage(true)}
                  >
                    <svg className="svg-icon" viewBox="0 0 20 20">
                      <path d="M12.522,10.4l-3.559,3.562c-0.172,0.173-0.451,0.176-0.625,0c-0.173-0.173-0.173-0.451,0-0.624l3.248-3.25L8.161,6.662c-0.173-0.173-0.173-0.452,0-0.624c0.172-0.175,0.451-0.175,0.624,0l3.738,3.736C12.695,9.947,12.695,10.228,12.522,10.4 M18.406,10c0,4.644-3.764,8.406-8.406,8.406c-4.644,0-8.406-3.763-8.406-8.406S5.356,1.594,10,1.594C14.643,1.594,18.406,5.356,18.406,10M17.521,10c0-4.148-3.374-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.147,17.521,17.521,14.147,17.521,10"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className={` ${showSearchMessage ? "flex" : "hidden"} justify-center mt-2`}>
                <div className="mb-3 xl:w-100 w-full">
                  <input
                    type="search"
                    className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded-2xl transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                    id="exampleSearch"
                    placeholder="Type content message"
                  />
                </div>
              </div>
            </div> */}

            {/* khung tao nhom chat moi */}
            <div className="flex flex-col w-full p-[10px] rounded-lg cursor-pointer hover:bg-gray-100">
              <div className="flex flex-row w-full">
                <div className="grow leading-9" onClick={() => setShowCreateGroups(!showCreateGroups)}>
                  Create a group chat with
                </div>
                {showCreateGroups ? (
                  <div
                    className="flex items-center justify-center rounded-2xl h-8 w-8 ml-2 cursor-pointer"
                    onClick={() => setShowCreateGroups(false)}
                  >
                    <svg className="svg-icon" viewBox="0 0 20 20">
                      <path d="M13.962,8.885l-3.736,3.739c-0.086,0.086-0.201,0.13-0.314,0.13S9.686,12.71,9.6,12.624l-3.562-3.56C5.863,8.892,5.863,8.611,6.036,8.438c0.175-0.173,0.454-0.173,0.626,0l3.25,3.247l3.426-3.424c0.173-0.172,0.451-0.172,0.624,0C14.137,8.434,14.137,8.712,13.962,8.885 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.148,17.521,17.521,14.147,17.521,10"></path>
                    </svg>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-2xl h-8 w-8 ml-2 cursor-pointer"
                    onClick={() => setShowCreateGroups(true)}
                  >
                    <svg className="svg-icon" viewBox="0 0 20 20">
                      <path d="M12.522,10.4l-3.559,3.562c-0.172,0.173-0.451,0.176-0.625,0c-0.173-0.173-0.173-0.451,0-0.624l3.248-3.25L8.161,6.662c-0.173-0.173-0.173-0.452,0-0.624c0.172-0.175,0.451-0.175,0.624,0l3.738,3.736C12.695,9.947,12.695,10.228,12.522,10.4 M18.406,10c0,4.644-3.764,8.406-8.406,8.406c-4.644,0-8.406-3.763-8.406-8.406S5.356,1.594,10,1.594C14.643,1.594,18.406,5.356,18.406,10M17.521,10c0-4.148-3.374-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.147,17.521,17.521,14.147,17.521,10"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className={`${showCreateGroups ? "flex" : "hidden"} justify-center mt-2 flex-col`}>
                <div className="mb-3 xl:w-100 w-full">
                  <input
                    type="search"
                    onKeyDown={(e) => {
                      handleClickAddUserToListGroup(e);
                    }}
                    className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded-2xl transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                    id="exampleSearch"
                    placeholder="Type username to add to group"
                  />
                </div>
                <div className="flex flex-col mt-2">
                  {listUserAddToGroup?.map((userInfo, index) => {
                    return (
                      <div className={`flex flex-row items-center rounded-xl p-2 cursor-auto`} key={index}>
                        <div className="contents border overflow-hidden">
                          <img src={userInfo.avatarUrl} alt="avt" className="h-8 w-8 object-cover mr-1" />
                        </div>
                        <div className="flex flex-col items-start ml-2 text-md font-semibold">
                          <div className="">{userInfo.username}</div>
                        </div>
                        <div
                          onClick={() => handleClickRemoveListGroup(userInfo._id)}
                          className="flex items-center justify-center ml-auto  bg-red-500 text-white h-6 w-20 rounded leading-none cursor-pointer"
                        >
                          Remove
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleClickCreateGroupButton}
                  className={`flex items-center justify-center mt-4 mx-auto bg-green-500 text-white h-8 w-4/5 rounded leading-none ${
                    listUserAddToGroup?.length >= 2 ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (filterChattingUser?.length >= 1) {
    const listNameMembers = `${filterChattingUser[0].username}, ${filterChattingUser[1].username}, ...`;
    return (
      <div className="flex flex-row items-center h-20 rounded-xl bg-green-200 w-full px-4">
        <ToastContainer />
        <div className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10 mr-1 cursor-pointer">
          <svg className="svg-icon" viewBox="0 0 20 20">
            <path d="M15.573,11.624c0.568-0.478,0.947-1.219,0.947-2.019c0-1.37-1.108-2.569-2.371-2.569s-2.371,1.2-2.371,2.569c0,0.8,0.379,1.542,0.946,2.019c-0.253,0.089-0.496,0.2-0.728,0.332c-0.743-0.898-1.745-1.573-2.891-1.911c0.877-0.61,1.486-1.666,1.486-2.812c0-1.79-1.479-3.359-3.162-3.359S4.269,5.443,4.269,7.233c0,1.146,0.608,2.202,1.486,2.812c-2.454,0.725-4.252,2.998-4.252,5.685c0,0.218,0.178,0.396,0.395,0.396h16.203c0.218,0,0.396-0.178,0.396-0.396C18.497,13.831,17.273,12.216,15.573,11.624 M12.568,9.605c0-0.822,0.689-1.779,1.581-1.779s1.58,0.957,1.58,1.779s-0.688,1.779-1.58,1.779S12.568,10.427,12.568,9.605 M5.06,7.233c0-1.213,1.014-2.569,2.371-2.569c1.358,0,2.371,1.355,2.371,2.569S8.789,9.802,7.431,9.802C6.073,9.802,5.06,8.447,5.06,7.233 M2.309,15.335c0.202-2.649,2.423-4.742,5.122-4.742s4.921,2.093,5.122,4.742H2.309z M13.346,15.335c-0.067-0.997-0.382-1.928-0.882-2.732c0.502-0.271,1.075-0.429,1.686-0.429c1.828,0,3.338,1.385,3.535,3.161H13.346z"></path>
          </svg>
        </div>
        <div className="flex flex-col items-start justify-center grow ml-2">
          <div className="ml-2 text-lg font-semibold">{listNameMembers}</div>
          <div className="ml-2 text-sm font-semibold opacity-50 hover:opacity-75">
            {status > 1 ? `${status} members online` : `${status} member online`}
          </div>
        </div>
        <div className="flex">
          <div
            onClick={() => {
              setShowInfoDetails(!showInfoDetails);
            }}
            className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10 ml-2 cursor-pointer"
          >
            <svg className="svg-icon h-6 w-6" viewBox="0 0 20 20">
              <path d="M10,1.529c-4.679,0-8.471,3.792-8.471,8.471c0,4.68,3.792,8.471,8.471,8.471c4.68,0,8.471-3.791,8.471-8.471C18.471,5.321,14.68,1.529,10,1.529 M10,17.579c-4.18,0-7.579-3.399-7.579-7.579S5.82,2.421,10,2.421S17.579,5.82,17.579,10S14.18,17.579,10,17.579 M14.348,10c0,0.245-0.201,0.446-0.446,0.446h-5c-0.246,0-0.446-0.201-0.446-0.446s0.2-0.446,0.446-0.446h5C14.146,9.554,14.348,9.755,14.348,10 M14.348,12.675c0,0.245-0.201,0.446-0.446,0.446h-5c-0.246,0-0.446-0.201-0.446-0.446s0.2-0.445,0.446-0.445h5C14.146,12.229,14.348,12.43,14.348,12.675 M7.394,10c0,0.245-0.2,0.446-0.446,0.446H6.099c-0.245,0-0.446-0.201-0.446-0.446s0.201-0.446,0.446-0.446h0.849C7.194,9.554,7.394,9.755,7.394,10 M7.394,12.675c0,0.245-0.2,0.446-0.446,0.446H6.099c-0.245,0-0.446-0.201-0.446-0.446s0.201-0.445,0.446-0.445h0.849C7.194,12.229,7.394,12.43,7.394,12.675 M14.348,7.325c0,0.246-0.201,0.446-0.446,0.446h-5c-0.246,0-0.446-0.2-0.446-0.446c0-0.245,0.2-0.446,0.446-0.446h5C14.146,6.879,14.348,7.08,14.348,7.325 M7.394,7.325c0,0.246-0.2,0.446-0.446,0.446H6.099c-0.245,0-0.446-0.2-0.446-0.446c0-0.245,0.201-0.446,0.446-0.446h0.849C7.194,6.879,7.394,7.08,7.394,7.325"></path>
            </svg>
          </div>
          <div
            className={`${
              showInfoDetails ? "flex" : "hidden"
            } absolute top-[110px] right-[40px] flex-col w-2/5 bg-white p-5 rounded-lg items-center z-10 shadow-md shadow-cyan-500/50`}
          >
            <div className="flex flex-col items-center w-full px-4 rounded-lg">
              <div className="h-16 w-16 rounded-full overflow-hidden ">
                <svg className="svg-icon" viewBox="0 0 20 20">
                  <path d="M15.573,11.624c0.568-0.478,0.947-1.219,0.947-2.019c0-1.37-1.108-2.569-2.371-2.569s-2.371,1.2-2.371,2.569c0,0.8,0.379,1.542,0.946,2.019c-0.253,0.089-0.496,0.2-0.728,0.332c-0.743-0.898-1.745-1.573-2.891-1.911c0.877-0.61,1.486-1.666,1.486-2.812c0-1.79-1.479-3.359-3.162-3.359S4.269,5.443,4.269,7.233c0,1.146,0.608,2.202,1.486,2.812c-2.454,0.725-4.252,2.998-4.252,5.685c0,0.218,0.178,0.396,0.395,0.396h16.203c0.218,0,0.396-0.178,0.396-0.396C18.497,13.831,17.273,12.216,15.573,11.624 M12.568,9.605c0-0.822,0.689-1.779,1.581-1.779s1.58,0.957,1.58,1.779s-0.688,1.779-1.58,1.779S12.568,10.427,12.568,9.605 M5.06,7.233c0-1.213,1.014-2.569,2.371-2.569c1.358,0,2.371,1.355,2.371,2.569S8.789,9.802,7.431,9.802C6.073,9.802,5.06,8.447,5.06,7.233 M2.309,15.335c0.202-2.649,2.423-4.742,5.122-4.742s4.921,2.093,5.122,4.742H2.309z M13.346,15.335c-0.067-0.997-0.382-1.928-0.882-2.732c0.502-0.271,1.075-0.429,1.686-0.429c1.828,0,3.338,1.385,3.535,3.161H13.346z"></path>
                </svg>
              </div>
              <div className="text-sm font-semibold mt-2">{listNameMembers}</div>
            </div>

            {/* khung tim kiem tin nhan
            <div className="flex flex-col w-full p-[10px] rounded-lg mb-3 cursor-pointer hover:bg-gray-100">
              <div className="flex flex-row w-full">
                <div className="grow leading-9" onClick={() => setShowSearchMessage(!showSearchMessage)}>
                  Search Messages
                </div>
                {showSearchMessage ? (
                  <div
                    className="flex items-center justify-center rounded-2xl h-8 w-8 ml-2 cursor-pointer"
                    onClick={() => setShowSearchMessage(false)}
                  >
                    <svg className="svg-icon" viewBox="0 0 20 20">
                      <path d="M13.962,8.885l-3.736,3.739c-0.086,0.086-0.201,0.13-0.314,0.13S9.686,12.71,9.6,12.624l-3.562-3.56C5.863,8.892,5.863,8.611,6.036,8.438c0.175-0.173,0.454-0.173,0.626,0l3.25,3.247l3.426-3.424c0.173-0.172,0.451-0.172,0.624,0C14.137,8.434,14.137,8.712,13.962,8.885 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.148,17.521,17.521,14.147,17.521,10"></path>
                    </svg>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-2xl h-8 w-8 ml-2 cursor-pointer"
                    onClick={() => setShowSearchMessage(true)}
                  >
                    <svg className="svg-icon" viewBox="0 0 20 20">
                      <path d="M12.522,10.4l-3.559,3.562c-0.172,0.173-0.451,0.176-0.625,0c-0.173-0.173-0.173-0.451,0-0.624l3.248-3.25L8.161,6.662c-0.173-0.173-0.173-0.452,0-0.624c0.172-0.175,0.451-0.175,0.624,0l3.738,3.736C12.695,9.947,12.695,10.228,12.522,10.4 M18.406,10c0,4.644-3.764,8.406-8.406,8.406c-4.644,0-8.406-3.763-8.406-8.406S5.356,1.594,10,1.594C14.643,1.594,18.406,5.356,18.406,10M17.521,10c0-4.148-3.374-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.147,17.521,17.521,14.147,17.521,10"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className={` ${showSearchMessage ? "flex" : "hidden"} justify-center mt-2`}>
                <div className="mb-3 xl:w-100 w-full">
                  <input
                    type="search"
                    className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded-2xl transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                    id="exampleSearch"
                    placeholder="Type content message"
                  />
                </div>
              </div>
            </div> */}

            {/* khung tao nhom chat moi */}
            <div className="flex flex-col w-full p-[10px] rounded-lg cursor-pointer hover:bg-gray-100">
              <div className="flex flex-row w-full">
                <div className="grow leading-9" onClick={() => setShowCreateGroups(!showCreateGroups)}>
                  Group Member
                </div>
                {showCreateGroups ? (
                  <div
                    className="flex items-center justify-center rounded-2xl h-8 w-8 ml-2 cursor-pointer"
                    onClick={() => setShowCreateGroups(false)}
                  >
                    <svg className="svg-icon" viewBox="0 0 20 20">
                      <path d="M13.962,8.885l-3.736,3.739c-0.086,0.086-0.201,0.13-0.314,0.13S9.686,12.71,9.6,12.624l-3.562-3.56C5.863,8.892,5.863,8.611,6.036,8.438c0.175-0.173,0.454-0.173,0.626,0l3.25,3.247l3.426-3.424c0.173-0.172,0.451-0.172,0.624,0C14.137,8.434,14.137,8.712,13.962,8.885 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.148,17.521,17.521,14.147,17.521,10"></path>
                    </svg>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-2xl h-8 w-8 ml-2 cursor-pointer"
                    onClick={() => setShowCreateGroups(true)}
                  >
                    <svg className="svg-icon" viewBox="0 0 20 20">
                      <path d="M12.522,10.4l-3.559,3.562c-0.172,0.173-0.451,0.176-0.625,0c-0.173-0.173-0.173-0.451,0-0.624l3.248-3.25L8.161,6.662c-0.173-0.173-0.173-0.452,0-0.624c0.172-0.175,0.451-0.175,0.624,0l3.738,3.736C12.695,9.947,12.695,10.228,12.522,10.4 M18.406,10c0,4.644-3.764,8.406-8.406,8.406c-4.644,0-8.406-3.763-8.406-8.406S5.356,1.594,10,1.594C14.643,1.594,18.406,5.356,18.406,10M17.521,10c0-4.148-3.374-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.147,17.521,17.521,14.147,17.521,10"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className={`${showCreateGroups ? "flex" : "hidden"} justify-center mt-2 flex-col`}>
                <div className="mb-3 xl:w-100 w-full">
                  <input
                    type="search"
                    onKeyDown={(e) => {
                      handleClickAddUserToCurrentGroup(e);
                    }}
                    className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded-2xl transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                    placeholder="Type username to add to group"
                  />
                </div>
                <div className="flex flex-col mt-2">
                  {listUserAddToGroup?.map((userInfo, index) => {
                    return (
                      <div
                        className={`flex flex-row items-center rounded-xl p-2 cursor-auto`}
                        id={`div-index-${index}`}
                        key={index}
                      >
                        <div className="contents border overflow-hidden">
                          <img src={userInfo.avatarUrl} alt="avt" className="h-8 w-8 object-cover mr-1" />
                        </div>
                        <div className="flex flex-col items-start ml-2 text-md font-semibold">
                          <div className="">{userInfo.username}</div>
                        </div>
                        <div
                          onClick={() => handleClickRemoveUserFromGroup(userInfo._id, index)}
                          className={` flex items-center justify-center ml-auto  bg-red-500 text-white h-6 w-20 rounded leading-none cursor-pointer ${
                            !isDeletingUserFromGroup ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          Remove
                        </div>
                      </div>
                    );
                  })}
                  {userInfoAddToCurrentGroup && (
                    <div className={`flex flex-row items-center rounded-xl p-2 cursor-auto bg-green-200`}>
                      <div className="contents border overflow-hidden">
                        <img
                          src={userInfoAddToCurrentGroup.avatarUrl}
                          alt="avt"
                          className="h-8 w-8 object-cover mr-1"
                        />
                      </div>
                      <div className="flex flex-col items-start ml-2 text-md font-semibold">
                        <div className="">{userInfoAddToCurrentGroup.username}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex">
                  <div
                    className={`flex items-center justify-center mt-4 mr-2 bg-green-500 text-white h-8 w-4/5 rounded leading-none ${
                      isDeletingUserFromGroup ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={handleClickConfirm}
                  >
                    Confirm
                  </div>
                  <div
                    onClick={handleCancel}
                    className={`flex items-center justify-center mt-4 ml-2 bg-gray-200 h-8 w-4/5 rounded leading-none ${
                      isDeletingUserFromGroup ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Cancel
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default InfoContact;
