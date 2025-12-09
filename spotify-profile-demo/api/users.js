import { kv } from "@vercel/kv";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const users = await kv.get("users") || [];
        return res.status(200).json(users);
    }

    if (req.method === "POST") {
        const user = req.body;

        if (!user || !user.id) {
            return res.status(400).json({ error: "Invalid user" });
        }

        let users = await kv.get("users") || [];

        const i = users.findIndex(u => u.id === user.id);

        if (i !== -1) users[i] = user;
        else users.push(user);

        await kv.set("users", users);

        return res.status(200).json({ message: "saved", user });
    }

    return res.status(405).json({ error: "Not allowed" });
}
