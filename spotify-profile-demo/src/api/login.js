export default function handler(req, res) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    const scope = "user-read-private user-read-email user-read-recently-played user-top-read";

    // Simple redirect without PKCE (simpler for Vercel)
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'token', // Implicit grant
        redirect_uri: redirectUri,
        scope
    });

    res.writeHead(302, { Location: `https://accounts.spotify.com/authorize?${params}` });
    res.end();
}

