// api/login.js
export default function handler(req, res) {
    const clientId = process.env.SPOTIFY_CLIENT_ID; // use env variables
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    const scope = "user-read-private user-read-email user-read-recently-played user-top-read";

    // Generate random code verifier/challenge (PKCE)
    const verifier = [...Array(128)].map(() => Math.random().toString(36)[2]).join('');
    const base64url = str => Buffer.from(str).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const challenge = base64url(
        require('crypto').createHash('sha256').update(verifier).digest()
    );

    // Store verifier in cookie (or memory)
    res.setHeader('Set-Cookie', `verifier=${verifier}; Path=/; HttpOnly`);

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        scope
    });

    // Redirect user to Spotify login
    res.writeHead(302, { Location: `https://accounts.spotify.com/authorize?${params}` });
    res.end();
}
