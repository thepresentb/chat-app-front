// import React from "react";
// import { useJwt } from "react-jwt";
// import { Navigate } from "react-router-dom";

const RefreshLogin = ({ children }) => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
  // /

  return children;
};

export default RefreshLogin;
