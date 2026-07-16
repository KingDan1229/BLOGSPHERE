const fullNameInput = document.getElementById("fullName");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const checkFullName = document.getElementById("checkFullName");
const checkUsername = document.getElementById("checkUsername");
const checkEmail = document.getElementById("checkEmail");
const checkPassword = document.getElementById("checkPassword");
const checkConfirmPassword = document.getElementById("checkConfirmPassword");
const signupForm = document.querySelector("body form");

const resetField = (field, messageEl) => {
    field.style.border = "1px solid #dfe7f5";
    messageEl.classList.remove("show");
    messageEl.classList.add("hide");
};

fullNameInput.addEventListener("focus", () => resetField(fullNameInput, checkFullName));
usernameInput.addEventListener("focus", () => resetField(usernameInput, checkUsername));
emailInput.addEventListener("focus", () => resetField(emailInput, checkEmail));
passwordInput.addEventListener("focus", () => resetField(passwordInput, checkPassword));
confirmPasswordInput.addEventListener("focus", () => resetField(confirmPasswordInput, checkConfirmPassword));

const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");
const saveUsers = (users) => localStorage.setItem("users", JSON.stringify(users));
const setCurrentUser = (user) => localStorage.setItem("currentUser", JSON.stringify(user));
const getInitials = (fullName) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

function formValidation(event) {
    event.preventDefault();
    let valid = true;
    const fullName = fullNameInput.value.trim();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const users = getUsers();

    if (fullName === "") {
        fullNameInput.style.border = "2px solid red";
        checkFullName.textContent = "Please enter your full name";
        checkFullName.classList.remove("hide");
        checkFullName.classList.add("show");
        valid = false;
    }

    if (username === "") {
        usernameInput.style.border = "2px solid red";
        checkUsername.textContent = "Please enter your username";
        checkUsername.classList.remove("hide");
        checkUsername.classList.add("show");
        valid = false;
    }

    if (email === "") {
        emailInput.style.border = "2px solid red";
        checkEmail.textContent = "Please enter your email";
        checkEmail.classList.remove("hide");
        checkEmail.classList.add("show");
        valid = false;
    } else if (!emailPattern.test(email)) {
        emailInput.style.border = "2px solid red";
        checkEmail.textContent = "Please enter a valid email address";
        checkEmail.classList.remove("hide");
        checkEmail.classList.add("show");
        valid = false;
    }

    const hasMinLength = password.length >= 8;

    if (!hasMinLength) {
        passwordInput.style.border = "2px solid red";
        checkPassword.textContent = "Password must be at least 8 characters.";
        checkPassword.classList.remove("hide");
        checkPassword.classList.add("show");
        valid = false;
    }

    if (confirmPassword === "" || confirmPassword !== password) {
        confirmPasswordInput.style.border = "2px solid red";
        checkConfirmPassword.textContent = "Passwords do not match";
        checkConfirmPassword.classList.remove("hide");
        checkConfirmPassword.classList.add("show");
        valid = false;
    }

    const usernameTaken = users.some((user) => user.username.toLowerCase() === username.toLowerCase());
    const emailTaken = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

    if (usernameTaken) {
        usernameInput.style.border = "2px solid red";
        checkUsername.textContent = "That username is already taken";
        checkUsername.classList.remove("hide");
        checkUsername.classList.add("show");
        valid = false;
    }

    if (emailTaken) {
        emailInput.style.border = "2px solid red";
        checkEmail.textContent = "That email is already registered";
        checkEmail.classList.remove("hide");
        checkEmail.classList.add("show");
        valid = false;
    }

    if (!valid) {
        return false;
    }

    const initials = getInitials(fullName);
    const newUser = {
        fullName,
        username,
        email,
        password,
        initials,
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser({
        fullName,
        username,
        email,
        initials,
    });

    window.location.href = "./index.html";
    return false;
}

if (signupForm) {
    signupForm.addEventListener("submit", formValidation);
}
