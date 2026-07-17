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






// 3. Modal - Dynamic Content Loader
const modal = document.getElementById('articleModal');
if (modal && window.jQuery) {
    $(modal).on('show.bs.modal', function(event) {
        const button = $(event.relatedTarget);
        const title = button.data('title');
        const image = button.data('image');
        const category = button.data('category');
        const author = button.data('author');
        let content = button.data('content');

        if (!content) {
            content = generateArticlePreview(title, category);
        }

        document.getElementById('modalTitle').textContent = title || 'Article';
        document.getElementById('modalImage').src = image || '';
        document.getElementById('modalCategory').textContent = category || 'General';
        document.getElementById('modalCategory').className = `badge badge-${getCategoryColor(category) || 'primary'} mb-3`;
        document.getElementById('modalContent').textContent = content;
        document.getElementById('modalAuthor').innerHTML = `<i class="bi bi-person"></i> ${author || 'Unknown'}`;
    });
}

// Helper function to assign colors based on category
function getCategoryColor(category) {
    const colors = {
        'Technology': 'primary',
        'Lifestyle': 'success',
        'Travel': 'warning',
        'Food': 'danger',
        'Health': 'info',
        'Business': 'secondary'
    };
    return colors[category] || 'primary';
}

function generateArticlePreview(title, category) {
    const base = title ? `${title} is a thoughtful article` : 'This article';
    if (!category) {
        return `${base} that explores the topic in a clear and engaging way.`;
    }
    return `${base} on ${category.toLowerCase()} that provides useful ideas, tips, and practical examples to help readers learn more about the subject.`;
}


console.log('💡 Click "Read More" on any article to see the modal in action!');

