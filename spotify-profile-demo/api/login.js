// api/login.js
export default function handler(req, res) {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
    const scope = [
        "user-read-private",
        "user-read-email",
        "user-top-read",
        "user-read-recently-played"
    ].join(" ");

    const auth_url = `https://accounts.spotify.com/authorize` +
                 `?client_id=${client_id}` +
                 `&response_type=code` +
                 `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
                 `&scope=${encodeURIComponent(scope)}`;
    console.log("Auth URL:", auth_url);


    // Redirect the browser to Spotify login
    res.writeHead(302, { Location: auth_url });
    res.end();
}
