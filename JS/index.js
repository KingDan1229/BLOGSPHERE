// ================================================================
//  INDEX PAGE - JAVASCRIPT
//  ================================================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {

    console.log('✅ Index page loaded');

    // ============================================================
    //  MENU TOGGLE (HAMBURGER)
    //  ============================================================
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        // Click event for hamburger
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
    const profileDropdown = document.getElementById('profileDropdown');
    const pdName = document.getElementById('pdName');
    const pdMeta = document.getElementById('pdMeta');
    const logoutBtn = document.getElementById('logoutBtn');

    // Get user from localStorage
    function getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                return JSON.parse(userData);
            }
            // Fallback: check if we have user info from login
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

    function clearCurrentUser() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
    }

    function showProfile(user) {
        if (!user) return;
        profileWrap.classList.add('show');
        profileAvatar.textContent = user.initials || user.fullName?.charAt(0).toUpperCase() || '?';
        pdName.textContent = user.fullName || user.name || 'Unknown';
        pdMeta.textContent = user.email || '';
    }

    function hideProfile() {
        profileWrap.classList.remove('show');
        profileAvatar.textContent = '??';
        pdName.textContent = '—';
        pdMeta.textContent = '—';
    }

    function toggleDropdown(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('open');
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

    // Profile avatar click
    if (profileAvatar) {
        profileAvatar.addEventListener('click', toggleDropdown);
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            clearCurrentUser();
            hideProfile();
            profileDropdown.classList.remove('open');
            window.location.href = './signup.html';
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (profileWrap && !profileWrap.contains(e.target)) {
            profileDropdown.classList.remove('open');
        }
    });

    // ============================================================
    //  MODAL (Article Popup)
    //  ============================================================
    // We'll use Bootstrap's modal with jQuery since you're using Bootstrap 4

    if (typeof $ !== 'undefined') {
        $('#articleModal').on('show.bs.modal', function(event) {
            const button = $(event.relatedTarget);
            const title = button.data('title');
            const image = button.data('image');
            const category = button.data('category');
            const author = button.data('author');
            const content = button.data('content');

            // If no content, generate a preview
            let finalContent = content;
            if (!finalContent) {
                finalContent = generateArticlePreview(title, category);
            }

            document.getElementById('modalTitle').textContent = title || 'Article';
            document.getElementById('modalImage').src = image || '';
            document.getElementById('modalCategory').textContent = category || 'General';
            
            // Set category color
            const colorClass = getCategoryColor(category) || 'primary';
            document.getElementById('modalCategory').className = `badge badge-${colorClass} mb-3`;
            
            document.getElementById('modalContent').textContent = finalContent;
            document.getElementById('modalAuthor').innerHTML = `<i class="bi bi-person"></i> ${author || 'Unknown'}`;
        });
    } else {
        console.log('⚠️ jQuery not loaded. Modal might not work.');
    }

    // ============================================================
    //  HELPER FUNCTIONS
    //  ============================================================

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

    console.log('✅ Index JavaScript loaded successfully');
});