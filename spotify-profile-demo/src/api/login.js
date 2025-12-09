export default function handler(req, res) {
    const redirect_uri = "https://cs226final.vercel.app/api/callback";
    const client_id = process.env.SPOTIFY_CLIENT_ID;

    const scope = [
        "user-read-private",
        "user-read-email",
        "user-read-recently-played",
        "user-top-read",
    ].join(" ");

    const url =
        `https://accounts.spotify.com/authorize` +
        `?response_type=code` +
        `&client_id=${client_id}` +
        `&scope=${encodeURIComponent(scope)}` +
        `&redirect_uri=${encodeURIComponent(redirect_uri)}`;

    res.redirect(url);
}
