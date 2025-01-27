import React, { useEffect, useState } from "react";
import "./login.css";

const Login = () => {
  const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID; 
  const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
  const AUTH_ENDPOINT = process.env.REACT_APP_AUTH_ENDPOINT; 
  const RESPONSE_TYPE = process.env.REACT_APP_RESPONSE_TYPE; 

  const scopes = [
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-currently-playing",
  ];

  const SCOPES = scopes.join("%20");
  const LOGIN_URL = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SCOPES}`;

  const [token, setToken] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);



  return (
    <div className="login-page">
      <a className="login-button" href={LOGIN_URL}>
        Login with Spotify
      </a>
    </div>
  );
};

export default Login;
