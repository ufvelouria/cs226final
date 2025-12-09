export default async function handler(req, res) {
    const code = req.query.code;
    const redirect_uri = "https://cs226final.vercel.app/api/callback";

    const creds = Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${creds}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            redirect_uri,
            grant_type: "authorization_code",
        }),
    });

    const data = await response.json();

    // redirect back to frontend with token
    res.redirect(`/app?token=${data.access_token}`);
}
