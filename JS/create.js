

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {

    console.log('✅ Create page loaded');

    // ============================================================
    //  MENU TOGGLE (HAMBURGER)
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
        console.log('⚠️ Menu toggle or nav not found');
    }

    // ============================================================
    //  PROFILE AVATAR
    //  ============================================================
    const profileWrap = document.getElementById('profileWrap');
    const profileAvatar = document.getElementById('profileAvatar');

    // Get user from localStorage
    function getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                return JSON.parse(userData);
            }
            const userId = localStorage.getItem('userId');
            const userName = localStorage.getItem('userName');
            if (userId && userName) {
                return {
                    id: userId,
                    fullName: userName,
                    initials: userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                    email: localStorage.getItem('userEmail') || ''
                };
            }
            return null;
        } catch (e) {
            console.error('Error getting user:', e);
            return null;
        }
    }

    function showProfile(user) {
        if (!user || !profileWrap) return;
        profileWrap.classList.add('show');
        if (profileAvatar) {
            profileAvatar.textContent = user.initials || user.fullName?.charAt(0).toUpperCase() || '?';
        }
    }

    function hideProfile() {
        if (profileWrap) profileWrap.classList.remove('show');
        if (profileAvatar) profileAvatar.textContent = '??';
    }

    // Initialize profile
    const user = getCurrentUser();
    if (user) {
        showProfile(user);
        console.log('👤 User logged in:', user.fullName);
    } else {
        hideProfile();
        console.log('👤 No user logged in');
    }

    // ============================================================
    //  CHECK IF USER IS LOGGED IN (For creating posts)
    //  ============================================================
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    console.log('🔑 Token:', token);
    console.log('👤 User ID:', userId);

    // If not logged in, redirect to signup page
    if (!token || !userId) {
        alert('⚠️ Please login to create a post.');
        window.location.href = 'signup.html';
        return;
    }

    // ============================================================
    //  GET THE FORM
    //  ============================================================
    const form = document.getElementById('createPostForm');

    if (!form) {
        console.log('⚠️ Create post form not found.');
        return;
    }

    console.log('✅ Form found!');

    // ============================================================
    //  LISTEN FOR FORM SUBMIT
    //  ============================================================
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('📝 Form submitted!');

        // Get form values
        const title = document.getElementById('postTitle').value.trim();
        const category = document.getElementById('postCategory').value;
        const content = document.getElementById('postContent').value.trim();

        // Validate
        if (!title) {
            alert('⚠️ Please enter a title.');
            document.getElementById('postTitle').focus();
            return;
        }
        if (!category) {
            alert('⚠️ Please select a category.');
            document.getElementById('postCategory').focus();
            return;
        }
        if (!content) {
            alert('⚠️ Please enter some content.');
            document.getElementById('postContent').focus();
            return;
        }

        // Create post data
        const postData = {
            title: title,
            category: category,
            content: content,
            userId: userId,
            userName: userName || 'User',
            createdAt: new Date().toISOString()
        };

        console.log('📝 Post data:', postData);

        // Disable submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Publishing...';

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save to localStorage
        let userPosts = JSON.parse(localStorage.getItem('blog_posts')) || [];
        const newPost = {
            id: Date.now().toString(),
            ...postData,
            likes: [],
            comments: [],
            isHardcoded: false
        };
        userPosts.push(newPost);
        localStorage.setItem('blog_posts', JSON.stringify(userPosts));

        console.log('💾 Post saved!');
        console.log('📋 Total posts:', userPosts.length);

        // Show success
        alert('✅ Post published successfully!');

        // Reset form
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Redirect to categories page
        window.location.href = 'categories.html?category=' + encodeURIComponent(category);
    });

    console.log('✅ Create Post JavaScript loaded!');
    console.log('👤 Logged in as:', userName);
});

console.log('✅ create.js loaded');