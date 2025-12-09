export default async function handler(req, res) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    const profile = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: "Bearer " + token }
    }).then(r => r.json());

    res.status(200).json(profile);
}
