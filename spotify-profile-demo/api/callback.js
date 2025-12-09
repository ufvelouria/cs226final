import fetch from "node-fetch";
import cookie from "cookie";

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
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

    if (!tokenRes.ok) return res.status(500).send(`Spotify token error: ${JSON.stringify(data)}`);

    const isProd = process.env.NODE_ENV === "production";

    res.setHeader("Set-Cookie", [
      cookie.serialize("spotify_token", data.access_token, {
        httpOnly: true,
        secure: isProd,
        maxAge: 3600,
        path: "/",
        sameSite: "none" // important for OAuth redirects
      }),
      cookie.serialize("spotify_refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: isProd,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "none"
      })
    ]);

    res.writeHead(302, { Location: "/" });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching access token");
  }
}
