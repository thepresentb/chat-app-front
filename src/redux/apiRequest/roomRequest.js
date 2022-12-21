import axios from "axios";
import { setListRoom } from "../slice/roomSlice";

const initListRoom = async (userId, dispatch) => {
  const token = localStorage.getItem("token");
  if (token) {
    const res = await axios.get(`https://chat-app-one-amber.vercel.app/api/messages/getLastMessage/${userId}`, {
      headers: { token: token },
    });
    dispatch(setListRoom(res.data));
  }
};

export { initListRoom };
