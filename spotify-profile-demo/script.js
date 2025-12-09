// script.js
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Not logged in");

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

    } catch (err) {
        // Not logged in, show login button
        const loginBtn = document.createElement("button");
        loginBtn.textContent = "Login with Spotify";
        loginBtn.onclick = () => window.location.href = "/api/login";
        document.body.appendChild(loginBtn);
    }
});
