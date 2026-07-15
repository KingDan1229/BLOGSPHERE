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
const setCurrentUser = (user) => localStorage.setItem("currentUser", JSON.stringify(user));
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
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    let valid = true;
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

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
        checkPassword.textContent = "Please enter your password";
        checkPassword.classList.remove("hide");
        checkPassword.classList.add("show");
        valid = false;
    }

    if (!valid) {
        return false;
    }

    const users = getUsers();
    const account = users.find((user) =>
        user.username.toLowerCase() === username.toLowerCase() &&
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password
    );

    if (!account) {
        usernameInput.style.border = "2px solid red";
        emailInput.style.border = "2px solid red";
        passwordInput.style.border = "2px solid red";

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

    setCurrentUser({
        fullName: account.fullName,
        username: account.username,
        email: account.email,
        initials: account.initials || getInitials(account.fullName),
    });

    window.location.href = "./index.html";
    return false;
}

if (loginForm) {
    loginForm.addEventListener("submit", formValidation);
}
