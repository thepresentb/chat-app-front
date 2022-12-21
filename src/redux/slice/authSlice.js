import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  register: {
    isFetching: false,
    result: null,
  },
  login: {
    isFetching: false,
    result: null,
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    registerStart: (state) => {
      state.register.isFetching = true;
    },

    registerSuccess: (state, action) => {
      state.register.isFetching = false;
      state.register.result = action.payload;
    },

    registerError: (state, action) => {
      state.register.isFetching = false;
      state.register.result = action.payload;
    },

    loginStart: (state) => {
      state.login.isFetching = true;
    },

    loginSuccess: (state) => {
      state.login.isFetching = false;
      state.login.result = { statusbar: "success" };
    },

    loginError: (state, action) => {
      state.login.isFetching = false;
      state.currentUser = null;
      state.login.result = action.payload;
    },
  },
});

export const { registerError, registerSuccess, registerStart, loginStart, loginSuccess, loginError } =
  authSlice.actions;

export default authSlice.reducer;
