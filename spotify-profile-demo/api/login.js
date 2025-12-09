// api/login.js
const querystring = require("querystring");

module.exports = (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scope = "user-read-private user-read-email user-read-recently-played user-top-read";

  const params = querystring.stringify({
    response_type: "code",
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
};
