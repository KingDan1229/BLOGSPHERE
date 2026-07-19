// ================================================================
//  PROFILE PAGE - WITH EXPANDABLE "READ MORE" & HAMBURGER MENU
//  ================================================================

document.addEventListener('DOMContentLoaded', function() {

    console.log('✅ Profile page loaded');

    // ============================================================
    //  HAMBURGER MENU TOGGLE
    //  ============================================================
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mainNav.classList.toggle('open');
            menuToggle.classList.toggle('open');
            const isOpen = mainNav.classList.contains('open');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            console.log('🍔 Menu toggled:', isOpen ? 'open' : 'closed');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                mainNav.classList.remove('open');
                menuToggle.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    } else {
        console.log('⚠️ Menu toggle or nav not found on profile page');
    }

    // ============================================================
    //  CHECK IF USER IS LOGGED IN
    //  ============================================================
    if (!isLoggedIn()) {
        alert('⚠️ Please login to view your profile.');
        window.location.href = 'login.html';
        return;
    }

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    console.log('👤 User ID:', userId);
    console.log('👤 User Name:', userName);

    // ============================================================
    //  DOM ELEMENTS
    //  ============================================================
    const profileAvatar = document.getElementById('profileAvatar');
    const profileInitials = document.getElementById('profileInitials');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePostCount = document.getElementById('profilePostCount');
    const profileLikesCount = document.getElementById('profileLikesCount');
    const userPostsContainer = document.getElementById('userPosts');

    // ============================================================
    //  LOGOUT FUNCTION
    //  ============================================================
    function handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('currentUser');
            console.log('✅ User logged out');
            window.location.href = './index.html';
        }
    }

    // ============================================================
    //  ATTACH LOGOUT BUTTONS
    //  ============================================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
        });
    }

    const logoutBtnLarge = document.getElementById('logoutBtnLarge');
    if (logoutBtnLarge) {
        logoutBtnLarge.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    // ============================================================
    //  GET INITIALS FROM NAME
    //  ============================================================
    function getInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    // ============================================================
    //  UPDATE PROFILE HEADER FROM LOCALSTORAGE
    //  ============================================================
    function updateProfileHeaderFromLocalStorage() {
        const name = userName || 'User';
        const email = userEmail || '';
        const initials = getInitials(name);

        if (profileAvatar) profileAvatar.textContent = initials;
        if (profileInitials) profileInitials.textContent = initials;
        if (profileName) profileName.textContent = name;
        if (profileEmail) profileEmail.textContent = email;
        if (profilePostCount) profilePostCount.textContent = 'Loading...';
        if (profileLikesCount) profileLikesCount.textContent = 'Loading...';
    }

    // ============================================================
    //  UPDATE PROFILE HEADER FROM API
    //  ============================================================
    function updateProfileHeaderFromAPI(user) {
        const name = user.name || userName || 'User';
        const initials = getInitials(name);

        if (profileAvatar) profileAvatar.textContent = initials;
        if (profileInitials) profileInitials.textContent = initials;
        if (profileName) profileName.textContent = name;
        if (profileEmail) profileEmail.textContent = user.email || userEmail || '';

        const postCount = user.postCount || 0;
        const likesCount = user.likesCount || 0;
        if (profilePostCount) profilePostCount.textContent = postCount + ' Posts';
        if (profileLikesCount) profileLikesCount.textContent = likesCount + ' Likes';
    }

    // ============================================================
    //  GET ALL POSTS FROM LOCALSTORAGE
    //  ============================================================
    function getPostsFromLocalStorage() {
        const hardcoded = JSON.parse(localStorage.getItem('blog_hardcoded')) || [];
        const userPosts = JSON.parse(localStorage.getItem('blog_posts')) || [];
        return [...hardcoded, ...userPosts];
    }

    // ============================================================
    //  GET USER'S POSTS FROM LOCALSTORAGE
    //  ============================================================
    function getUserPostsFromLocalStorage() {
        const allPosts = getPostsFromLocalStorage();
        return allPosts.filter(post => post.userId === userId && !post.isHardcoded);
    }

    // ============================================================
    //  RENDER USER POSTS (with Expandable Read More)
    //  ============================================================
    function renderUserPosts(posts) {
        if (!posts || posts.length === 0) {
            userPostsContainer.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="bi bi-file-earmark-plus display-4 text-muted"></i>
                    <p class="text-muted mt-2">You haven't written any posts yet.</p>
                    <a href="./create.html" class="btn btn-primary mt-2">
                        <i class="bi bi-plus-circle"></i> Create Post
                    </a>
                </div>
            `;
            return;
        }

        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        userPostsContainer.innerHTML = posts.map(post => renderPostCard(post)).join('');

        attachPostListeners();

        const totalLikes = posts.reduce((sum, p) => sum + (p.likes ? p.likes.length : 0), 0);
        if (profilePostCount) profilePostCount.textContent = posts.length + ' Posts';
        if (profileLikesCount) profileLikesCount.textContent = totalLikes + ' Likes';
    }

    // ============================================================
    //  RENDER SINGLE POST CARD (with Expandable Read More)
    //  ============================================================
    function renderPostCard(post) {
        const likeCount = post.likes ? post.likes.length : 0;
        const commentCount = post.comments ? post.comments.length : 0;

        const previewText = post.content.substring(0, 150);
        const fullText = post.content;
        const hasMore = post.content.length > 150;

        return `
            <div class="col-md-6 col-lg-4">
                <div class="card post-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge bg-primary tag">${escapeHTML(post.category)}</span>
                            ${post.updatedAt ? '<span class="badge bg-warning text-dark tag" style="font-size:0.6rem;"><i class="bi bi-pencil"></i> Edited</span>' : ''}
                        </div>
                        <h5 class="card-title">${escapeHTML(post.title)}</h5>

                        <!-- Content Preview -->
                        <div class="post-content">
                            <p class="card-text text-muted small post-preview" id="preview_${post.id}">
                                ${escapeHTML(previewText)}${hasMore ? '...' : ''}
                            </p>
                            <div class="post-full-content collapse" id="fullContent_${post.id}">
                                <p class="card-text text-muted small">${escapeHTML(fullText)}</p>
                            </div>
                        </div>

                        ${hasMore ? `
                            <button class="btn btn-sm btn-outline-primary read-more-btn mt-2" 
                                    data-post-id="${post.id}"
                                    onclick="toggleReadMore('${post.id}')">
                                <i class="bi bi-chevron-down"></i> Read More
                            </button>
                        ` : ''}

                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <div>
                                <span class="badge bg-secondary">
                                    <i class="bi bi-heart"></i> ${likeCount}
                                </span>
                                <span class="badge bg-info text-dark ms-1">
                                    <i class="bi bi-chat"></i> ${commentCount}
                                </span>
                            </div>
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-outline-primary edit-btn" data-post-id="${post.id}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-btn" data-post-id="${post.id}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-2">
                            <i class="bi bi-clock"></i> ${new Date(post.createdAt).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    //  ATTACH EDIT/DELETE LISTENERS
    //  ============================================================
    function attachPostListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = this.dataset.postId;
                window.location.href = 'edit.html?id=' + postId;
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const postId = this.dataset.postId;
                if (!confirm('Are you sure you want to delete this post?')) return;

                let deleted = false;
                try {
                    const result = await apiDeletePost(postId);
                    if (result.success) deleted = true;
                } catch (e) {
                    console.log('API not available, using localStorage');
                }

                if (!deleted) {
                    let allPosts = getPostsFromLocalStorage();
                    allPosts = allPosts.filter(p => p.id !== postId);
                    const hardcoded = allPosts.filter(p => p.isHardcoded);
                    const userPosts = allPosts.filter(p => !p.isHardcoded);
                    localStorage.setItem('blog_hardcoded', JSON.stringify(hardcoded));
                    localStorage.setItem('blog_posts', JSON.stringify(userPosts));
                    deleted = true;
                }

                if (deleted) {
                    alert('✅ Post deleted successfully!');
                    loadProfile();
                } else {
                    alert('❌ Could not delete post.');
                }
            });
        });
    }

    // ============================================================
    //  TOGGLE READ MORE / READ LESS (Global function)
    //  ============================================================
    window.toggleReadMore = function(postId) {
        const fullContent = document.getElementById('fullContent_' + postId);
        const preview = document.getElementById('preview_' + postId);
        const btn = document.querySelector(`.read-more-btn[data-post-id="${postId}"]`);

        if (!fullContent || !btn) return;

        if (fullContent.classList.contains('show')) {
            fullContent.classList.remove('show');
            if (preview) preview.style.display = 'block';
            btn.innerHTML = '<i class="bi bi-chevron-down"></i> Read More';
        } else {
            fullContent.classList.add('show');
            if (preview) preview.style.display = 'none';
            btn.innerHTML = '<i class="bi bi-chevron-up"></i> Read Less';
        }
    };

    // ============================================================
    //  LOAD PROFILE
    //  ============================================================
    async function loadProfile() {
        updateProfileHeaderFromLocalStorage();

        userPostsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted mt-2">Loading your posts...</p>
            </div>
        `;

        let loadedFromAPI = false;
        try {
            const result = await apiGetUserProfile(userId);
            if (result.success) {
                updateProfileHeaderFromAPI(result.user);
                renderUserPosts(result.posts || []);
                loadedFromAPI = true;
            }
        } catch (e) {
            console.log('API not available, using localStorage');
        }

        if (!loadedFromAPI) {
            const userPosts = getUserPostsFromLocalStorage();
            renderUserPosts(userPosts);
        }
    }

    // ============================================================
    //  HELPER FUNCTIONS
    //  ============================================================
    function escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================================
    //  LOAD PROFILE ON PAGE LOAD
    //  ============================================================
    loadProfile();

    console.log('✅ Profile page ready');

    // ============================================================
    //  CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    //  ============================================================
    document.addEventListener('click', function(e) {
        const profileWrap = document.getElementById('profileWrap');
        const dropdown = document.getElementById('profileDropdown');
        if (profileWrap && dropdown && !profileWrap.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

});

console.log('✅ profile.js loaded');