const loginBtn = document.getElementById("login-btn");
const profileContainer = document.querySelector(".profile-card");

loginBtn.onclick = () => {
    window.location.href = "/api/login"; // full browser redirect
};

async function loadProfile() {
    try {
        const res = await fetch("/api/profile", { credentials: "include" });
        if (!res.ok) {
            loginBtn.style.display = "block";
            profileContainer.style.display = "none";
            return;
        }

        const profile = await res.json();
        loginBtn.style.display = "none";
        profileContainer.style.display = "block";

        document.getElementById("displayName").textContent = profile.display_name;
        document.getElementById("followers").textContent = `${profile.followers.total} followers`;

        const avatarDiv = document.getElementById("avatar");
        if (profile.images && profile.images.length > 0) {
            avatarDiv.innerHTML = `<img src="${profile.images[0].url}" alt="Avatar">`;
        }

    } catch (err) {
        console.error(err);
    }
}

// Load profile on page load
loadProfile();
