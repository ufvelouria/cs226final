// const clientId = "6c119d659723461ea03ee2c8e4957245"; // Replace with your client ID
// const params = new URLSearchParams(window.location.search);
// const code = params.get("code");
// if (!code) {
//     redirectToAuthCodeFlow(clientId);
// } else {
//     const accessToken = await getAccessToken(clientId, code);
//     const profile = await fetchProfile(accessToken);
//     populateUI(profile);
// }
const clientId = "6c119d659723461ea03ee2c8e4957245";
const redirectUri = "https://cs226final.vercel.app/";

const recentTracks = 10;


const topArtists = await fetchTopArtists();
async function init() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const storedToken = localStorage.getItem("access_token");
    // makes sure that this works if the token is expired or invalid
    if (storedToken && storedToken !== "null" && storedToken !== "") {
        try { //try and catch to make sure that token is valid
            const profile = await fetchProfile(storedToken);
            if (!profile || profile.error) throw new Error("Token invalid");
            const tracks = await fetchRecentTracks();
            populateUI(profile, tracks);
        } catch (err) {
            console.log("Stored token invalid, re-authenticating...");
            localStorage.removeItem("access_token");
            redirectToAuthCodeFlow(clientId);
        }
    } else if (code) {
        //gets code from spotify callback, lets user in
        const token = await getAccessToken(clientId, code);
        const profile = await fetchProfile(token);
        const tracks = await fetchRecentTracks();
        populateUI(profile, tracks);
    } else {
        // no code or token created, redirect to spotify auth
        redirectToAuthCodeFlow(clientId);
    }
}

// Call init() at the start
init();

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri);
    params.append("scope", "user-read-private user-read-email user-read-recently-played user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;``
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
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
    localStorage.setItem("access_token", access_token);
    return access_token;
}
async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}
async function fetchRecentTracks() {
    const accessToken = localStorage.getItem("access_token"); // store it when first fetched
    if (!accessToken) return [];

    const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=" + recentTracks, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.items.map(item => item.track);
}

function populateUI(profile) {
    // Display name
    document.getElementById("displayName").innerText = profile.display_name;

    // Followers
    document.getElementById("followers").innerText = `Followers: ${profile.followers.total}`;

    // Avatar clickable
    const avatarContainer = document.getElementById("avatar");
    avatarContainer.innerHTML = ""; // clear previous

    if (profile.images[0]) {
        const link = document.createElement("a");
        link.href = profile.external_urls.spotify;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        profileImage.style.borderRadius = "50%";
        profileImage.style.cursor = "pointer";

        link.appendChild(profileImage);
        avatarContainer.appendChild(link);
    }

    // Fetch last played tracks
    fetchRecentTracks().then(tracks => {
        const container = document.getElementById("recent-tracks");
        container.innerHTML = "";

        tracks.forEach(track => {
            const card = document.createElement("div");
            card.className = "track-card";
            card.style.cursor = "pointer"; // show clickable cursor

            // Open Spotify track when card is clicked
            card.onclick = () => {
                window.open(track.external_urls.spotify, "_blank");
            };

            const img = new Image();
            img.src = track.album.images[0]?.url || "";
            img.style.width = "60px";
            img.style.height = "60px";
            img.style.borderRadius = "8px";
            img.style.marginRight = "12px";
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
    }); 
    populateTopArtists(profile, recentTracks);
}
async function fetchTopArtists() {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return [];

    const res = await fetch("https://api.spotify.com/v1/me/top/artists?limit=10", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.items; // array of top artists
}
async function populateTopArtists(profile, recentTracks) {
    const artists = await fetchTopArtists();
    const container = document.getElementById("top-artists");
    container.innerHTML = "<h3>Top Artists</h3>";

    if (!artists || artists.length === 0) {
        container.innerHTML += "<p>No top artists found.</p>";
        return;
    }

    artists.forEach(artist => {
        const card = document.createElement("div");
        card.className = "artist-card";

        card.onclick = () => window.open(artist.external_urls.spotify, "_blank");

        const img = new Image();
        img.src = artist.images[0]?.url || "";
        card.appendChild(img);

        const name = document.createElement("div");
        name.innerText = artist.name;
        name.className = "artist-name";

        card.appendChild(name);
        container.appendChild(card);
    });
}
function saveUserData(profile, recentTracks, topArtists) {

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const filtered = users.filter(u => u.id !== profile.id);


    const newUser = {
        id: profile.id,
        displayName: profile.display_name,
        followers: profile.followers.total,
        avatar: profile.images[0]?.url || "",
        recentTracks: recentTracks,
        topArtists: topArtists.map(a => ({ name: a.name, url: a.external_urls.spotify, image: a.images[0]?.url }))
    };


    filtered.push(newUser);
    localStorage.setItem("users", JSON.stringify(filtered));
    saveUserData(profile, recentTracks, topArtists);
}
function getAllUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}