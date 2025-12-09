// async function init() {
//     const params = new URLSearchParams(window.location.search);
//     const tokenFromUrl = params.get("token");
//     let token = tokenFromUrl || localStorage.getItem("access_token");

//     if (!token) {
//         // No token → go login
//         window.location.href = "/api/login";
//         return;
//     }

//     if (tokenFromUrl) {
//         localStorage.setItem("access_token", tokenFromUrl);
//         window.history.replaceState({}, document.title, "/"); // remove ?token=...
//         token = tokenFromUrl;
//     }

//     const profile = await fetch("/api/profile", {
//         headers: { Authorization: "Bearer " + token }
//     }).then(r => r.json());

//     const tracks = await fetch("/api/recent-tracks", {
//         headers: { Authorization: "Bearer " + token }
//     }).then(r => r.json());
//     const artists = await fetch("/api/top-artists", {
//         headers: { Authorization: "Bearer " + token }
//     }).then(r => r.json());
//     await saveUserToBackend(profile, artists);
//     const allUsers = await fetch("/api/users").then(r => r.json());

//     populateUI(profile, tracks, artists, allUsers);
// }

// // Call init() at the start
// init();
// // async function fetchProfile(token) {
// //     const result = await fetch("https://api.spotify.com/v1/me", {
// //         method: "GET", headers: { Authorization: `Bearer ${token}` }
// //     });

// //     return await result.json();
// // }
// // async function fetchRecentTracks() {
// //     const accessToken = localStorage.getItem("access_token"); // store it when first fetched
// //     if (!accessToken) return [];

// //     const res = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=" + recentTracks, {
// //         headers: { Authorization: `Bearer ${accessToken}` }
// //     });

// //     if (!res.ok) return [];

// //     const data = await res.json();
// //     return data.items.map(item => item.track);
// // }

// function populateUI(profile, recentTracks, topArtists, allUsers) {
//     // Display name
//     document.getElementById("displayName").innerText = profile.display_name;

//     // Followers
//     document.getElementById("followers").innerText = `Followers: ${profile.followers.total}`;

//     // Avatar clickable
//     const avatarContainer = document.getElementById("avatar");
//     avatarContainer.innerHTML = ""; // clear previous

//     populateAvatar(profile);
//     populateRecentTracks(recentTracks);
    
//     // Fetch last played tracks
//     populateTopArtists(topArtists);
    
// }
// // async function fetchTopArtists() {
// //     const accessToken = localStorage.getItem("access_token");
// //     if (!accessToken) return [];

// //     const res = await fetch("https://api.spotify.com/v1/me/top/artists?limit=10", {
// //         headers: { Authorization: `Bearer ${accessToken}` }
// //     });

// //     if (!res.ok) return [];
// //     const data = await res.json();
// //     return data.items; // array of top artists
// // }
// function populateAvatar(profile) {
//     const avatarContainer = document.getElementById("avatar");
//     avatarContainer.innerHTML = "";

//     if (profile.images?.length > 0) {
//         const link = document.createElement("a");
//         link.href = profile.external_urls.spotify;
//         link.target = "_blank";

//         const img = new Image(200, 200);
//         img.src = profile.images[0].url;
//         img.style.borderRadius = "50%";

//         link.appendChild(img);
//         avatarContainer.appendChild(link);
//     }
// }
// function populateRecentTracks(tracks) {
//     const container = document.getElementById("recent-tracks");
//     container.innerHTML = "";

//     tracks.forEach(track => {
//         const card = document.createElement("div");
//         card.className = "track-card";
//         card.onclick = () => window.open(track.external_urls.spotify);

//         const img = new Image();
//         img.src = track.album.images[0].url;
//         img.className = "track-image";

//         const info = document.createElement("div");
//         info.className = "track-info";

//         info.innerHTML = `
//             <div class="track-name">${track.name}</div>
//             <div class="track-artist">${track.artists.map(a => a.name).join(", ")}</div>
//         `;

//         card.appendChild(img);
//         card.appendChild(info);
//         container.appendChild(card);
//     });
// }
// function populateTopArtists(artists) {
//     const container = document.getElementById("top-artists");
//     container.innerHTML = "<h3>Top Artists</h3>";

//     artists.forEach(artist => {
//         const card = document.createElement("div");
//         card.className = "artist-card";
//         card.onclick = () => window.open(artist.external_urls.spotify);

//         const img = new Image();
//         img.src = artist.images?.[0]?.url || "";
//         img.className = "artist-image";

//         const name = document.createElement("div");
//         name.className = "artist-name";
//         name.innerText = artist.name;

//         card.appendChild(img);
//         card.appendChild(name);
//         container.appendChild(card);
//     });
// }
// async function saveUserToBackend(profile, topArtists) {
//     await fetch("/api/users", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//             id: profile.id,
//             displayName: profile.display_name,
//             avatar: profile.images?.[0]?.url || "",
//             topArtists: topArtists.map(a => a.name)
//         })
//     });
// }


// async function fetchAllUsersFromBackend() {
//     const res = await fetch("/api/users");
//     return await res.json();
// }
// //recommendation system based on shared top artists
// function getRecommendedUsers(currentProfile, currentTopArtists) {
//     const allUsers = JSON.parse(localStorage.getItem("users")) || [];

//     // Filter out the current user
//     const otherUsers = allUsers.filter(u => u.id !== currentProfile.id);

//     // Map users with a "score" based on shared artists
//     const scoredUsers = otherUsers.map(user => {
//         const sharedArtists = user.topArtists.filter(artist =>
//             currentTopArtists.some(a => a.name === artist.name)
//         );
//         return { ...user, sharedCount: sharedArtists.length };
//     });

//     // Sort by most shared artists
//     scoredUsers.sort((a, b) => b.sharedCount - a.sharedCount);

//     // Return top 5 recommendations
//     return scoredUsers.filter(u => u.sharedCount > 0).slice(0, 5);
// }
// function populateRecommended(profile, topArtists) {
//     const recommended = getRecommendedUsers(profile, topArtists);
//     const container = document.getElementById("recommended");
//     container.innerHTML = "<h3>Recommended People</h3>";

//     if (recommended.length === 0) {
//         container.innerHTML += "<p>No recommendations found.</p>";
//         return;
//     }

//     recommended.forEach(user => {
//         const card = document.createElement("div");
//         card.className = "user-card";

//         card.onclick = () => {
//             alert(`You clicked ${user.displayName}`); // could expand with more actions
//         };

//         const img = new Image();
//         img.src = user.avatar;
//         card.appendChild(img);

//         const name = document.createElement("div");
//         name.className = "user-name";
//         name.innerText = user.displayName;

//         card.appendChild(name);
//         container.appendChild(card);
//     });
// }

// script.js
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");

    if (!token) {
        // No token, show login button
        const loginBtn = document.createElement("button");
        loginBtn.textContent = "Login with Spotify";
        loginBtn.onclick = () => window.location.href = "/api/login";
        document.body.appendChild(loginBtn);
        return;
    }

    // Fetch Spotify profile data
    const res = await fetch(`/api/profile?token=${token}`);
    const data = await res.json();

    // Populate profile card
    document.getElementById("avatar").innerHTML = `<img src="${data.profile.images[0]?.url}" alt="avatar">`;
    document.getElementById("displayName").textContent = data.profile.display_name;
    document.getElementById("followers").textContent = `${data.profile.followers.total} followers`;

    // Populate recent tracks
    const recentTracksContainer = document.getElementById("recent-tracks");
    data.recentTracks.items.forEach(item => {
        const track = item.track;
        const trackCard = document.createElement("div");
        trackCard.className = "track-card";
        trackCard.innerHTML = `
            <img src="${track.album.images[0]?.url}" alt="${track.name}">
            <div class="track-info">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artists.map(a => a.name).join(", ")}</div>
            </div>
        `;
        recentTracksContainer.appendChild(trackCard);
    });

    // Populate top artists
    const topArtistsContainer = document.getElementById("top-artists");
    const heading = document.createElement("h3");
    heading.textContent = "Top Artists";
    topArtistsContainer.appendChild(heading);

    data.topArtists.items.forEach(artist => {
        const artistCard = document.createElement("div");
        artistCard.className = "artist-card";
        artistCard.innerHTML = `
            <img src="${artist.images[0]?.url}" alt="${artist.name}">
            <div class="artist-name">${artist.name}</div>
        `;
        topArtistsContainer.appendChild(artistCard);
    });
});
