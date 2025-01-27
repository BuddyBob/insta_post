import React, { useEffect, useState } from "react";
import ImageUpload from "./components/ImageUpload";
import Login from "./Auth/login";
import SearchSong from "./components/SearchSong";
import "./components/component.css";

function App() {
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

  const handleLogout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    window.location.reload(); // Clear hash and reload for a fresh start
  };

  return (
      <div className="App">
        <ImageUpload />
        {!token ? (
          <Login />
        ) : (
          <div className="container">
            <div className="logout-container">
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
            <SearchSong token={token} />
          </div>
        )}
      </div>
  );
}

export default App;
