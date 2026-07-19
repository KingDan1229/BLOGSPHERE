// ================================================================
//  API SERVICE - Connects Frontend to Python Backend
//  ================================================================

// Change this to your backend URL when deployed
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================================
//  HELPER FUNCTIONS
//  ============================================================

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Make API request with authentication
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = API_BASE_URL + endpoint;
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    const options = {
        method: method,
        headers: headers,
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: 'Connection error' };
    }
}

// ============================================================
//  AUTHENTICATION APIS
//  ============================================================

// User Signup
async function apiSignup(fullName, username, email, password) {
    const result = await apiRequest('/register', 'POST', {
        fullName,
        username,
        email,
        password
    });

    if (result.success) {
        // Store user data after signup
        localStorage.setItem('token', result.token);
        localStorage.setItem('userId', result.user.id);
        localStorage.setItem('userName', result.user.name);
        localStorage.setItem('userEmail', result.user.email);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
    }

    return result;
}

// User Login
async function apiLogin(email, password) {
    const result = await apiRequest('/login', 'POST', {
        email,
        password
    });

    if (result.success) {
        // Store user data after login
        localStorage.setItem('token', result.token);
        localStorage.setItem('userId', result.user.id);
        localStorage.setItem('userName', result.user.name);
        localStorage.setItem('userEmail', result.user.email);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
    }

    return result;
}

// User Logout
function apiLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentUser');
    window.location.href = './index.html';
}

// Get current user info
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        if (userData) return JSON.parse(userData);
        return null;
    } catch (e) {
        return null;
    }
}

// ============================================================
//  POST APIS
//  ============================================================

// Get all posts
async function apiGetPosts(category = null) {
    const endpoint = category ? `/posts?category=${category}` : '/posts';
    const result = await apiRequest(endpoint, 'GET');
    return result;
}

// Create a post
async function apiCreatePost(title, category, content) {
    const result = await apiRequest('/posts', 'POST', {
        title,
        category,
        content
    });
    return result;
}

// Update a post
async function apiUpdatePost(postId, title, category, content) {
    const result = await apiRequest(`/posts/${postId}`, 'PUT', {
        title,
        category,
        content
    });
    return result;
}

// Delete a post
async function apiDeletePost(postId) {
    const result = await apiRequest(`/posts/${postId}`, 'DELETE');
    return result;
}

// ============================================================
//  LIKE APIS
//  ============================================================

// Toggle like on a post
async function apiToggleLike(postId) {
    const result = await apiRequest(`/posts/${postId}/like`, 'POST');
    return result;
}

// ============================================================
//  COMMENT APIS
//  ============================================================

// Get comments for a post
async function apiGetComments(postId) {
    const result = await apiRequest(`/posts/${postId}/comments`, 'GET');
    return result;
}

// Add a comment
async function apiAddComment(postId, text) {
    const result = await apiRequest(`/posts/${postId}/comments`, 'POST', {
        text
    });
    return result;
}

// ============================================================
//  USER APIS
//  ============================================================

// Get user profile (with their posts)
async function apiGetUserProfile(userId) {
    const result = await apiRequest(`/users/${userId}`, 'GET');
    return result;
}

// Get user's posts
async function apiGetUserPosts(userId) {
    const result = await apiRequest(`/users/${userId}/posts`, 'GET');
    return result;
}

// ============================================================
//  CHECK IF LOGGED IN
//  ============================================================

function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

console.log('✅ API Service loaded');