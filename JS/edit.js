// ================================================================
//  EDIT POST - JAVASCRIPT
//  ================================================================

document.addEventListener('DOMContentLoaded', function() {

    console.log('✅ Edit page loaded');

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
        });
        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                mainNav.classList.remove('open');
                menuToggle.classList.remove('open');
            }
        });
    }

    // ============================================================
    //  PROFILE AVATAR
    //  ============================================================
    const profileWrap = document.getElementById('profileWrap');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileDropdown = document.getElementById('profileDropdown');
    const pdName = document.getElementById('pdName');
    const pdMeta = document.getElementById('pdMeta');
    const logoutBtn = document.getElementById('logoutBtn');

    function getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) return JSON.parse(userData);
            return null;
        } catch (e) {
            return null;
        }
    }

    function showProfile(user) {
        if (!user || !profileWrap) return;
        profileWrap.classList.add('show');
        if (profileAvatar) {
            profileAvatar.textContent = user.initials || user.name?.charAt(0).toUpperCase() || '?';
        }
        if (pdName) pdName.textContent = user.name || user.username || 'Unknown';
        if (pdMeta) pdMeta.textContent = user.email || '';
    }

    const user = getCurrentUser();
    if (user) {
        showProfile(user);
    }

    if (profileAvatar) {
        profileAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            if (profileDropdown) profileDropdown.classList.toggle('open');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('currentUser');
            window.location.href = './index.html';
        });
    }

    document.addEventListener('click', function(e) {
        if (profileWrap && !profileWrap.contains(e.target)) {
            if (profileDropdown) profileDropdown.classList.remove('open');
        }
    });

    // ============================================================
    //  CHECK IF USER IS LOGGED IN
    //  ============================================================
    if (!isLoggedIn()) {
        alert('⚠️ Please login to edit posts.');
        window.location.href = 'login.html';
        return;
    }

    // ============================================================
    //  GET POST ID FROM URL
    //  ============================================================
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    console.log('📝 Post ID:', postId);

    if (!postId) {
        alert('⚠️ No post ID provided.');
        window.location.href = 'profile.html';
        return;
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
    //  LOAD POST DATA
    //  ============================================================
    async function loadPost() {
        let post = null;

        // Try API first
        try {
            const allPosts = getPostsFromLocalStorage();
            post = allPosts.find(p => p.id === postId);
        } catch (e) {
            console.log('Error loading post:', e);
        }

        if (!post) {
            alert('❌ Post not found.');
            window.location.href = 'profile.html';
            return;
        }

        // Check if user owns this post
        const currentUserId = localStorage.getItem('userId');
        if (post.userId !== currentUserId && !post.isHardcoded) {
            alert('❌ You do not have permission to edit this post.');
            window.location.href = 'profile.html';
            return;
        }

        // Fill the form with post data
        document.getElementById('editPostId').value = post.id;
        document.getElementById('editTitle').value = post.title;
        document.getElementById('editCategory').value = post.category;
        document.getElementById('editContent').value = post.content;

        console.log('✅ Post loaded for editing:', post.title);
    }

    // ============================================================
    //  UPDATE POST
    //  ============================================================
    async function updatePost(event) {
        event.preventDefault();

        const postId = document.getElementById('editPostId').value;
        const title = document.getElementById('editTitle').value.trim();
        const category = document.getElementById('editCategory').value;
        const content = document.getElementById('editContent').value.trim();

        // Validate
        if (!title) {
            alert('⚠️ Please enter a title.');
            document.getElementById('editTitle').focus();
            return;
        }
        if (!category) {
            alert('⚠️ Please select a category.');
            document.getElementById('editCategory').focus();
            return;
        }
        if (!content) {
            alert('⚠️ Please enter some content.');
            document.getElementById('editContent').focus();
            return;
        }

        // Disable submit button
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Updating...';

        let updated = false;

        // Try API first
        try {
            const result = await apiUpdatePost(postId, title, category, content);
            if (result.success) {
                updated = true;
            }
        } catch (e) {
            console.log('API not available, using localStorage');
        }

        // If API failed, update localStorage
        if (!updated) {
            let allPosts = getPostsFromLocalStorage();
            const postIndex = allPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                allPosts[postIndex].title = title;
                allPosts[postIndex].category = category;
                allPosts[postIndex].content = content;
                allPosts[postIndex].updatedAt = new Date().toISOString();

                const hardcoded = allPosts.filter(p => p.isHardcoded);
                const userPosts = allPosts.filter(p => !p.isHardcoded);
                localStorage.setItem('blog_hardcoded', JSON.stringify(hardcoded));
                localStorage.setItem('blog_posts', JSON.stringify(userPosts));
                updated = true;
            }
        }

        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        if (updated) {
            alert('✅ Post updated successfully!');
            window.location.href = 'profile.html';
        } else {
            alert('❌ Could not update post.');
        }
    }

    // ============================================================
    //  ATTACH FORM LISTENER
    //  ============================================================
    const form = document.getElementById('editPostForm');
    if (form) {
        form.addEventListener('submit', updatePost);
    }

    // ============================================================
    //  LOAD POST ON PAGE LOAD
    //  ============================================================
    loadPost();

    console.log('✅ Edit page ready');
});

console.log('✅ edit.js loaded');