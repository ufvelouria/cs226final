const loginBtn = document.getElementById("login-btn"); // add a login button in HTML
const profileCard = document.querySelector(".profile-card");

loginBtn.onclick = () => {
  window.location.href = "/api/login"; // full redirect
};

async function loadProfile() {
  try {
    const res = await fetch("/api/profile", { credentials: "include" });
    if (!res.ok) {
      loginBtn.style.display = "block";
      profileCard.style.display = "none";
      return;
    }

    const profile = await res.json();

    loginBtn.style.display = "none";
    profileCard.style.display = "block";

    document.getElementById("displayName").textContent = profile.display_name;
    document.getElementById("followers").textContent = `${profile.followers.total} followers`;

    const avatarDiv = document.getElementById("avatar");
    if (profile.images && profile.images.length > 0) {
      avatarDiv.innerHTML = `<img src="${profile.images[0].url}" alt="Avatar">`;
    }

    // Here you can fetch and render top artists / recent tracks if desired

  } catch (err) {
    console.error(err);
  }
}

// Load profile on page load
loadProfile();
