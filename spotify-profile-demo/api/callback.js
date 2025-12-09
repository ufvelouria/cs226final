// api/callback.js
import fetch from "node-fetch";

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
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body
        });

        const data = await tokenResponse.json();
        const access_token = data.access_token;

        // Redirect to frontend with access token in query string
        res.writeHead(302, { Location: `/?access_token=${access_token}` });
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching access token");
    }
}
