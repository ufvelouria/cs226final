import querystring from "querystring";

export default async function handler(req, res) {
  const code = req.query.code || null;

  const redirectUri = "https://cs226final.vercel.app/api/callback";

  const authOptions = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' +
        Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')
    },
    body: querystring.stringify({
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  };

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', authOptions);
  const tokenJson = await tokenRes.json();

  return res.status(200).json(tokenJson);
}