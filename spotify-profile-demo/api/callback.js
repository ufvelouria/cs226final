// api/callback.js
import fetch from "node-fetch";
import cookie from "cookie";

export default async function handler(req, res) {
    const code = req.query.code || null;
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

    if (!code) {
        res.status(400).send("No code provided");
        return;
    }

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri,
        client_id,
        client_secret
    });

    try {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body
        });

        const data = await tokenResponse.json();

        // Check for errors from Spotify
        if (!tokenResponse.ok) {
        res.status(500).send(`Spotify token error: ${JSON.stringify(data)}`);
        return;
      }

        const access_token = data.access_token;
        const refresh_token = data.refresh_token;

        const isProduction = process.env.NODE_ENV === "production";

        res.setHeader("Set-Cookie", [
            cookie.serialize("spotify_token", access_token, {
                httpOnly: true,
                secure: isProduction,
                maxAge: 3600,
                path: "/"
            }),
            cookie.serialize("spotify_refresh_token", refresh_token, {
                httpOnly: true,
                secure: isProduction,
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/"
            })
        ]);

        // Redirect to homepage
        res.writeHead(302, { Location: "/" });
        res.end();

    } catch (err) {
        console.error("Unexpected error fetching token:", err);
        res.status(500).send(`Unexpected error: ${err.message}`);
    }
}
