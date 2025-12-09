app.get("/api/login", (req, res) => {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
  const scope = "user-read-private user-read-email user-read-recently-played user-top-read";

  const params = new URLSearchParams({
    client_id,
    response_type: "code",
    redirect_uri,
    scope,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});
