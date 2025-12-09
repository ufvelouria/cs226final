// api/callback.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
    const code = req.query.code;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    const clientId = process.env.SPOTIFY_CLIENT_ID;

    // Get code_verifier from cookie
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/verifier=([^;]+)/);
    const codeVerifier = match ? match[1] : "";

    const params = new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
    });

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });

    const data = await tokenRes.json();
    const accessToken = data.access_token;

    // Redirect back to frontend with token
    res.writeHead(302, { Location: `${redirectUri}?token=${accessToken}` });
    res.end();
}
