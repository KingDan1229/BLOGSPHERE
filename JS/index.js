const profileWrap = document.getElementById("profileWrap");
const profileAvatar = document.getElementById("profileAvatar");
const profileDropdown = document.getElementById("profileDropdown");
const pdName = document.getElementById("pdName");
const pdMeta = document.getElementById("pdMeta");
const logoutBtn = document.getElementById("logoutBtn");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch (error) {
        return null;
    }
};
const clearCurrentUser = () => localStorage.removeItem("currentUser");

const showProfile = (user) => {
    if (!user) return;
    profileWrap.classList.add("show");
    profileAvatar.textContent = user.initials || "?";
    pdName.textContent = user.fullName || user.username || "Unknown";
    pdMeta.textContent = user.email || user.username || "";
};

const hideProfile = () => {
    profileWrap.classList.remove("show");
    profileAvatar.textContent = "??";
    pdName.textContent = "—";
    pdMeta.textContent = "—";
};

const toggleDropdown = () => {
    profileDropdown.classList.toggle("open");
};

const initProfile = () => {
    const user = getCurrentUser();
    if (user) {
        showProfile(user);
    } else {
        hideProfile();
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfile);
} else {
    initProfile();
}

profileAvatar.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropdown();
});

logoutBtn.addEventListener("click", () => {
    clearCurrentUser();
    hideProfile();
    profileDropdown.classList.remove("open");
    window.location.href = "./login.html";
});

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        mainNav.classList.toggle("open");
        menuToggle.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", menuToggle.classList.contains("open") ? "true" : "false");
    });
}

window.addEventListener("click", (event) => {
    if (!profileWrap.contains(event.target)) {
        profileDropdown.classList.remove("open");
    }

    if (mainNav && menuToggle && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
        mainNav.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    }
});

initProfile();
