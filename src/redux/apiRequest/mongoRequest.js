import axios from "axios";
import { addSeenUserToListRoom } from "../slice/roomSlice";

const addMessageToDB = async (data) => {
  const token = localStorage.getItem("token");
  await axios.post(`https://chat-app-liard-zeta.vercel.app/api/messages/create`, data, {
    headers: { token: token },
  });
};

const addSeenUser = async (data, dispatch) => {
  const token = localStorage.getItem("token");
  dispatch(addSeenUserToListRoom(data));

  // add seen user vao to database
  await axios.post(`https://chat-app-liard-zeta.vercel.app/api/messages/addSeenUser`, data, {
    headers: { token: token },
  });
};

const getListUserSearched = async (username) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(`https://chat-app-liard-zeta.vercel.app/api/users/searchList`, {
      params: {
        username: username,
      },
      headers: {
        token: token,
      },
    });
    return res.data;
  } catch (err) {
    return { statusbar: "error", message: err };
  }
};

const getUserSearched = async (username) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(`https://chat-app-liard-zeta.vercel.app/api/users/search`, {
      params: {
        username: username,
      },
      headers: {
        token: token,
      },
    });
    return res.data;
  } catch (err) {
    return { statusbar: "error", message: err };
  }
};

const createRoomSearched = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `https://chat-app-liard-zeta.vercel.app/api/rooms/searchRoom`,
      {
        listUserId: data,
      },
      {
        headers: { token: token },
      }
    );
    return res.data;
  } catch (err) {
    return { statusbar: "error", message: err };
  }
};

const createRoomGroup = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `https://chat-app-liard-zeta.vercel.app/api/rooms/createRoom`,
      {
        listId: data,
      },
      {
        headers: { token: token },
      }
    );
    return res.data;
  } catch (err) {
    return { statusbar: "error", message: err };
  }
};

const addUserToCurrentGroup = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `https://chat-app-liard-zeta.vercel.app/api/rooms/addUserToRoom`,
      {
        roomId: data.roomId,
        userId: data.userId,
      },
      {
        headers: { token: token },
      }
    );
    return res.data;
  } catch (err) {
    return { statusbar: "error", message: err };
  }
};

const removeUserToCurrentGroup = async (data) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.post(
      `https://chat-app-liard-zeta.vercel.app/api/rooms/removeUserToRoom`,
      {
        roomId: data.roomId,
        userId: data.userId,
      },
      {
        headers: { token: token },
      }
    );
    return res.data;
  } catch (err) {
    return { statusbar: "error", message: err };
  }
};

const getListRoom = async (userId) => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(`https://chat-app-liard-zeta.vercel.app/api/users/${userId}`, {
      headers: {
        token: token,
      },
    });
    return res.data;
  } catch (err) {
    return { statusbar: "error", message: err };
  }
};

export {
  addMessageToDB,
  addSeenUser,
  getListUserSearched,
  createRoomSearched,
  getUserSearched,
  createRoomGroup,
  addUserToCurrentGroup,
  removeUserToCurrentGroup,
  getListRoom,
};
