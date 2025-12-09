// api/profile.js
import fetch from "node-fetch";

export default async function handler(req, res) {
    const token = req.query.token;
    if (!token) {
        res.status(400).json({ error: "No access token provided" });
        return;
    }

    try {
        const [profileRes, topArtistsRes, recentTracksRes] = await Promise.all([
            fetch("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch("https://api.spotify.com/v1/me/top/artists?limit=5", {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch("https://api.spotify.com/v1/me/player/recently-played?limit=5", {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        const profile = await profileRes.json();
        const topArtists = await topArtistsRes.json();
        const recentTracks = await recentTracksRes.json();

        res.status(200).json({ profile, topArtists, recentTracks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch Spotify data" });
    }
}
