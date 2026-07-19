// ================================================================
//  LOGIN - FIXED
//  ================================================================

// If already logged in, redirect to home
if (localStorage.getItem('token') && localStorage.getItem('userId')) {
    window.location.href = './index.html';
}

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const checkUsername = document.getElementById("checkUsername");
const checkEmail = document.getElementById("checkEmail");
const checkPassword = document.getElementById("checkPassword");
const loginForm = document.querySelector("body form");

const resetField = (field, messageEl) => {
    field.style.border = "1px solid rgba(255, 255, 255, 0.15)";
    messageEl.classList.remove("show");
    messageEl.classList.add("hide");
};

usernameInput.addEventListener("focus", () => resetField(usernameInput, checkUsername));
emailInput.addEventListener("focus", () => resetField(emailInput, checkEmail));
passwordInput.addEventListener("focus", () => resetField(passwordInput, checkPassword));

const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");

// ============================================================
//  ✅ FIXED: Save ALL required fields
//  ============================================================
const setCurrentUser = (user) => {
    // Save full user object for profile/avatar
    localStorage.setItem("currentUser", JSON.stringify(user));
    
    // Save individual fields for create page and other pages
    localStorage.setItem("token", "dummy-token-" + Date.now());
    localStorage.setItem("userId", user.id);
    localStorage.setItem("userName", user.fullName || user.username);
    localStorage.setItem("userEmail", user.email);
    
    console.log("✅ User session saved:", user.fullName);
};

const getInitials = (fullName, fallback) => {
    if (typeof fullName !== "string" || fullName.trim() === "") {
        return fallback ? fallback.slice(0, 1).toUpperCase() : "";
    }
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return fallback ? fallback.slice(0, 1).toUpperCase() : "";
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

function formValidation(event) {
    event.preventDefault();
    let valid = true;
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Clear previous error messages
    [checkUsername, checkEmail, checkPassword].forEach(el => {
        el.classList.remove("show");
        el.classList.add("hide");
    });
    [usernameInput, emailInput, passwordInput].forEach(el => {
        el.style.border = "1px solid rgba(255, 255, 255, 0.15)";
    });

    if (username === "") {
        usernameInput.style.border = "2px solid red";
        checkUsername.textContent = "Please enter your username";
        checkUsername.classList.remove("hide");
        checkUsername.classList.add("show");
        valid = false;
    }

    if (email === "" || !email.includes("@")) {
        emailInput.style.border = "2px solid red";
        checkEmail.textContent = "Please enter a valid email";
        checkEmail.classList.remove("hide");
        checkEmail.classList.add("show");
        valid = false;
    }

    if (password === "" || password.length < 8) {
        passwordInput.style.border = "2px solid red";
        checkPassword.textContent = "Please enter your password (min 8 characters)";
        checkPassword.classList.remove("hide");
        checkPassword.classList.add("show");
        valid = false;
    }

    if (!valid) return false;

    const users = getUsers();
    const account = users.find((user) =>
        user.username.toLowerCase() === username.toLowerCase() &&
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password
    );

    if (!account) {
        [usernameInput, emailInput, passwordInput].forEach(el => {
            el.style.border = "2px solid red";
        });
        checkUsername.textContent = "Username, email, or password is incorrect";
        checkUsername.classList.remove("hide");
        checkUsername.classList.add("show");
        checkEmail.textContent = "Username, email, or password is incorrect";
        checkEmail.classList.remove("hide");
        checkEmail.classList.add("show");
        checkPassword.textContent = "Username, email, or password is incorrect";
        checkPassword.classList.remove("hide");
        checkPassword.classList.add("show");
        return false;
    }

    // ✅ SUCCESS: Save session
    setCurrentUser({
        id: account.id || Date.now().toString(),
        fullName: account.fullName || account.username,
        username: account.username,
        email: account.email,
        initials: account.initials || getInitials(account.fullName || account.username),
        password: account.password
    });

    alert("✅ Welcome back, " + (account.fullName || account.username) + "!");
    window.location.href = "./index.html";
    return false;
}

if (loginForm) {
    loginForm.addEventListener("submit", formValidation);
}

console.log("✅ Login page loaded");