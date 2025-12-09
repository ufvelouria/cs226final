// api/profile.js
import fetch from "node-fetch";
import cookie from "cookie";

async function fetchSpotify(url, token) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) throw new Error("Token expired");
    return res.json();
}

export default async function handler(req, res) {
    const cookies = cookie.parse(req.headers.cookie || "");
    let token = cookies.spotify_token;

    if (!token) return res.status(401).json({ error: "Not logged in" });

    try {
        const [profile, topArtists, recentTracks] = await Promise.all([
            fetchSpotify("https://api.spotify.com/v1/me", token),
            fetchSpotify("https://api.spotify.com/v1/me/top/artists?limit=5", token),
            fetchSpotify("https://api.spotify.com/v1/me/player/recently-played?limit=5", token)
        ]);

        res.status(200).json({ profile, topArtists, recentTracks });
    } catch (err) {
        // If token expired, call /api/refresh
        if (err.message === "Token expired") {
            const refreshRes = await fetch(`${req.headers.origin}/api/refresh`);
            if (refreshRes.ok) {
                return handler(req, res); // retry with new token
            } else {
                return res.status(401).json({ error: "Refresh failed" });
            }
        }
        console.error(err);
        res.status(500).json({ error: "Failed to fetch Spotify data" });
    }
}
