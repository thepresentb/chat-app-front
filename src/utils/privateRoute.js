import React from "react";
import { useJwt } from "react-jwt";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token")?.split(" ")[1];
  const { isExpired } = useJwt(token);
  if (!token || isExpired) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
