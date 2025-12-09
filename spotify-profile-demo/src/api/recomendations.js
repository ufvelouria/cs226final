import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'api', 'users.json');

export default async function handler(req, res) {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    let users = [];
    try {
        const file = fs.readFileSync(dataFile, 'utf-8');
        users = JSON.parse(file);
    } catch (e) {
        users = [];
    }

    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) return res.status(404).json([]);

    // Compare last played tracks
    const recommendations = users
        .filter(u => u.id !== userId)
        .map(u => {
            const overlap = u.recent_tracks.filter(track =>
                currentUser.recent_tracks.some(t => t.name === track.name)
            );
            return { ...u, score: overlap.length };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // top 5 recommendations

    res.status(200).json(recommendations);
}
