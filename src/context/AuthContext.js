import React, { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useHistory } from "react-router-dom";
import { loginUser as loginUserService, registerUser as registerUserService } from "../services/AuthServices";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const history = useHistory();

  const loginUser = async (email, password) => {
    const { success, data, error } = await loginUserService(email, password);
    if (success && data) {
      setAuthTokens(data);
      setUser(jwtDecode(data.access));
      localStorage.setItem("authTokens", JSON.stringify(data));
      localStorage.setItem("token", data.access)
      history.push("/");
    } else {
      console.error("Login Error:", error);
      alert("Something went wrong");
    }
  };

  const registerUser = async (email, username, password, password2) => {
    const { success, error } = await registerUserService(email, username, password, password2);
    if (success) {
      history.push("/login");
    } else {
      console.error("Registration Error:", error);
      alert("Something went wrong");
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("token");
    history.push("/login");
  };

  useEffect(() => {
    if (authTokens) {
      try {
        setUser(jwtDecode(authTokens.access));
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
    setLoading(false);
  }, [authTokens]);

  const contextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    registerUser,
    loginUser,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
