import React, { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://localhost:3001/profile");
      const data = await response.json();
      setProfile(data);
    }
    fetchData();
  }, []);

  if (!profile) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-card">
      <img className="avatar" src={profile.images?.[0]?.url} alt="Avatar" />

      <h2>{profile.display_name}</h2>

      <a className="spotify-link" href={profile.external_urls.spotify} target="_blank">
        View on Spotify
      </a>

      <div className="stats">
        <div className="stat-box">
          <span className="label">Followers</span>
          <span className="value">{profile.followers.total}</span>
        </div>

        <div className="stat-box">
          <span className="label">Account Type</span>
          <span className="value">{profile.product}</span>
        </div>
      </div>
    </div>
  );
}
