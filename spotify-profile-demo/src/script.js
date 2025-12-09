// ====== CONFIG ======
const clientId = "6c119d659723461ea03ee2c8e4957245"; // Replace with your Spotify client ID
const redirectUri = "https://cs226final.vercel.app/"; // Your Vercel URL

// ====== INITIALIZE ======
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    localStorage.setItem("access_token", accessToken);

    const profile = await fetchProfile(accessToken);
    const recentTracks = await fetchRecentTracks(accessToken);

    populateUI(profile, recentTracks);
    await saveUser(profile, recentTracks);

    const recommendations = await fetchRecommendations(profile.id);
    displayRecommendations(recommendations);
}

// ====== SPOTIFY AUTH ======
export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri);
    params.append(
        "scope",
        "user-read-private user-read-email user-read-recently-played"
    );
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

// ====== SPOTIFY API ======
async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

async function fetchRecentTracks(token) {
    const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=5", {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items.map(item => item.track);
}

// ====== BACKEND ======
async function saveUser(profile, tracks) {
    await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: profile.id,
            display_name: profile.display_name,
            profile_url: profile.external_urls.spotify,
            avatar: profile.images[0]?.url || '',
            followers: profile.followers.total,
            recent_tracks: tracks
        })
    });
}

async function fetchRecommendations(userId) {
    const res = await fetch(`/api/recommendations?userId=${userId}`);
    if (!res.ok) return [];
    return await res.json();
}

// ====== UI POPULATION ======
function populateUI(profile, tracks) {
    // Display name
    document.getElementById("displayName").innerText = profile.display_name;

    // Followers
    document.getElementById("followers").innerText = `Followers: ${profile.followers.total}`;

    // Avatar clickable
    const avatarContainer = document.getElementById("avatar");
    avatarContainer.innerHTML = "";
    if (profile.images[0]) {
        const link = document.createElement("a");
        link.href = profile.external_urls.spotify;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const profileImage = new Image(150, 150);
        profileImage.src = profile.images[0].url;
        profileImage.style.borderRadius = "50%";
        profileImage.style.cursor = "pointer";
        profileImage.style.border = "4px solid #1DB954";

        link.appendChild(profileImage);
        avatarContainer.appendChild(link);
    }

    // Last 5 tracks
    const container = document.getElementById("recent-tracks");
    container.innerHTML = "";
    tracks.forEach(track => {
        const card = document.createElement("div");
        card.className = "track-card";

        const img = new Image();
        img.src = track.album.images[0]?.url || "";
        card.appendChild(img);

        const info = document.createElement("div");
        info.className = "track-info";

        const name = document.createElement("div");
        name.className = "track-name";
        name.innerText = track.name;

        const artist = document.createElement("div");
        artist.className = "track-artist";
        artist.innerText = track.artists.map(a => a.name).join(", ");

        info.appendChild(name);
        info.appendChild(artist);
        card.appendChild(info);

        container.appendChild(card);
    });
}

function displayRecommendations(users) {
    const container = document.getElementById("recommendations");
    container.innerHTML = "<h3>Recommended Profiles</h3>";
    users.forEach(user => {
        const card = document.createElement("div");
        card.className = "recommendation-card";

        const img = new Image();
        img.src = user.avatar;
        card.appendChild(img);

        const info = document.createElement("div");
        info.className = "recommendation-info";

        const name = document.createElement("div");
        name.className = "recommendation-name";
        name.innerText = user.display_name;

        const followers = document.createElement("div");
        followers.className = "recommendation-followers";
        followers.innerText = `Followers: ${user.followers}`;

        info.appendChild(name);
        info.appendChild(followers);
        card.appendChild(info);

        card.onclick = () => window.open(user.profile_url, "_blank");

        container.appendChild(card);
    });
}
