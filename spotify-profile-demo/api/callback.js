export default async function handler(req, res) {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("No code provided");

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    const frontendUrl = process.env.FRONTEND_URL || "https://cs226final.vercel.app/";

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).send("Missing environment variables");
    }

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

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("Spotify token error:", text);
      return res.status(500).send("Failed to get token from Spotify");
    }

    const data = await tokenRes.json();
    const access_token = data.access_token;

    if (!access_token) {
      return res.status(500).send("No access token received");
    }

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}?token=${access_token}`);
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).send("Server error");
  }
}
