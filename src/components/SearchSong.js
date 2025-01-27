import React, { useState } from "react";
import './component.css'

const SearchSong = ({ token }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data.tracks.items);
      setError("");
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search. Please check your Spotify account and permissions.");
    }
  };

  const playSong = async (uri) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [uri] }),
      });
  
      if (!response.ok) {

        throw new Error(`Error: ${response.status} - ${token}`);
      }
    } catch (error) {
      console.error("Error playing the track:", error);
      alert("Failed to play the track. Ensure Spotify is active, permissions are granted, and you have a premium account.");
    }
  };
  

  return (
    <div className="search-song-container">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for a song..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      <div className="song-results">
        {searchResults.map((track) => (
          <div key={track.id} className="song-result-item">
            <p>
              {track.name} by {track.artists[0].name}
            </p>
            <button onClick={() => playSong(track.uri)} className="play-button">Play</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchSong;
