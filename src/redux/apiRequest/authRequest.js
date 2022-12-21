import axios from "axios";
import {
  loginError,
  loginStart,
  loginSuccess,
  registerError,
  registerStart,
  registerSuccess,
} from "../slice/authSlice";

const registerUser = async (userInfo, dispatch) => {
  dispatch(registerStart());
  try {
    const res = await axios.post(`https://chat-app-one-amber.vercel.app/api/auth/register`, userInfo);
    if (res.data.statusbar === "error") {
      return dispatch(registerError(res.data));
    }
    dispatch(registerSuccess(res.data));
  } catch {
    dispatch(registerError({ statusbar: "error", message: "please try again" }));
  }
};

const loginUser = async (data, dispatch, navigate) => {
  dispatch(loginStart());
  try {
    const res = await axios.post(`https://chat-app-one-amber.vercel.app/api/auth/login`, data);
    if (res.data.statusbar === "error") {
      return dispatch(loginError(res.data));
    }
    const { accessToken, ...others } = res.data;
    localStorage.setItem("token", `Bearer ${accessToken}`);
    localStorage.setItem("currentUser", JSON.stringify(others));
    dispatch(loginSuccess());

    navigate("/");
  } catch {
    dispatch(loginError({ statusbar: "error", message: "please try again" }));
  }
};

export { registerUser, loginUser };
