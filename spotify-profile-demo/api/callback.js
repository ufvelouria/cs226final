import fetch from "node-fetch";

export default async function handler(req, res) {
  const code = req.query.code || null;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!code) return res.status(400).send("No code provided");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await tokenRes.json();
  const access_token = data.access_token;

  const frontendUrl = process.env.FRONTEND_URL || "https://cs226final.vercel.app/";
  res.redirect(`${frontendUrl}?token=${access_token}`);
}
