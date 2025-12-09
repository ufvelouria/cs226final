export default function handler(req, res) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scope = "user-read-private user-read-email user-read-recently-played user-top-read";

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scope,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}