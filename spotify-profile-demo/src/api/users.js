import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'api', 'users.json');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const user = req.body;

        // Load existing users
        let users = [];
        try {
            const file = fs.readFileSync(dataFile, 'utf-8');
            users = JSON.parse(file);
        } catch (e) {
            users = [];
        }

        // Check if user already exists
        const exists = users.find(u => u.id === user.id);
        if (!exists) users.push(user);

        // Save updated users
        fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));

        res.status(200).json({ success: true });
    } else if (req.method === 'GET') {
        // Return all users
        try {
            const file = fs.readFileSync(dataFile, 'utf-8');
            const users = JSON.parse(file);
            res.status(200).json(users);
        } catch (e) {
            res.status(200).json([]);
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
