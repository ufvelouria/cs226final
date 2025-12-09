import cookie from "cookie";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.spotify_token;

  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const profileRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!profileRes.ok) {
      const text = await profileRes.text();
      return res.status(profileRes.status).send(text);
    }

    const profile = await profileRes.json();
    res.status(200).json(profile);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
