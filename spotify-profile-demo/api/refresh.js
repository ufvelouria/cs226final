// api/refresh.js
import fetch from "node-fetch";
import cookie from "cookie";

export default async function handler(req, res) {
    const cookies = cookie.parse(req.headers.cookie || "");
    const refresh_token = cookies.spotify_refresh_token;

    if (!refresh_token) {
        res.status(401).json({ error: "No refresh token" });
        return;
    }

    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
    });

    try {
        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body
        });

        const data = await tokenRes.json();

        // Update access_token cookie
        res.setHeader("Set-Cookie", cookie.serialize("spotify_token", data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600,
            path: "/"
        }));

        res.status(200).json({ access_token: data.access_token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to refresh token" });
    }
}
