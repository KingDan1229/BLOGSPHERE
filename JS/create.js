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


// ================================================================
//  CREATE POST - JAVASCRIPT
//  ================================================================

// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {

    console.log('✅ DOM loaded!');

    // ============================================================
    //  CHECK IF USER IS LOGGED IN
    //  ============================================================
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    console.log('🔑 Token:', token);
    console.log('👤 User ID:', userId);
    console.log('👤 User Name:', userName);

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

    // Check if form exists on this page
    if (!form) {
        console.log('⚠️ Create post form not found on this page.');
        return;
    }

    console.log('✅ Form found!');

    // ============================================================
    //  LISTEN FOR FORM SUBMIT
    //  ============================================================
    form.addEventListener('submit', async function(event) {

        // Stop page from reloading
        event.preventDefault();

        console.log('📝 Form submitted!');

        // ============================================================
        //  STEP 1: GET FORM VALUES
        //  ============================================================
        const title = document.getElementById('postTitle').value.trim();
        const category = document.getElementById('postCategory').value;
        const content = document.getElementById('postContent').value.trim();

        console.log('📝 Title:', title);
        console.log('📂 Category:', category);
        console.log('📄 Content length:', content.length);

        // ============================================================
        //  STEP 2: VALIDATE (Check if all fields are filled)
        //  ============================================================
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

        // ============================================================
        //  STEP 3: CREATE POST DATA OBJECT
        //  ============================================================
        const postData = {
            title: title,
            category: category,
            content: content,
            userId: userId,
            userName: userName || 'User',
            createdAt: new Date().toISOString()
        };

        console.log('📝 Post data:', postData);

        // ============================================================
        //  STEP 4: DISABLE SUBMIT BUTTON
        //  ============================================================
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Publishing...';

        // ============================================================
        //  STEP 5: SAVE TO LOCALSTORAGE
        //  ============================================================
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get existing user posts from localStorage
        let userPosts = JSON.parse(localStorage.getItem('blog_posts')) || [];
        
        // Add new post with unique ID
        const newPost = {
            id: Date.now().toString(),
            ...postData,
            likes: [],
            comments: [],
            isHardcoded: false
        };
        
        userPosts.push(newPost);
        localStorage.setItem('blog_posts', JSON.stringify(userPosts));
        
        console.log('💾 Post saved to LocalStorage!');
        console.log('📋 Total user posts:', userPosts.length);
        console.log('📋 New post:', newPost);

        // Show success message
        alert('✅ Post published successfully!');

        // ============================================================
        //  STEP 6: RESET FORM & REDIRECT
        //  ============================================================
        
        // Reset form
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        // Redirect to categories page so user can see their post
        // Redirect to the specific category page
        window.location.href = 'categories.html?category=' + encodeURIComponent(category);

    });

    console.log('✅ Create Post JavaScript loaded successfully!');
    console.log('👤 Logged in as:', userName);
});

// ================================================================
//  HELPER FUNCTIONS (For use in other pages)
//  ================================================================

// Get all posts from LocalStorage (hardcoded + user)
function getAllPosts() {
    // Get hardcoded posts
    let hardcodedPosts = JSON.parse(localStorage.getItem('blog_hardcoded')) || [];
    
    // If no hardcoded posts stored, create default ones
    if (hardcodedPosts.length === 0) {
        hardcodedPosts = [
            {
                id: 'hardcoded_1',
                userId: 'system',
                userName: 'BlogSphere Team',
                title: 'Top 5 Tips for Web Development in 2026',
                category: 'Technology',
                content: 'Web development is constantly evolving. In this article, we explore the top 5 tips that every developer should know in 2026. From responsive design principles to performance optimization, we cover it all. Whether you are a beginner or a seasoned pro, these tips will help you level up your skills and build better websites.',
                likes: ['user1', 'user2'],
                comments: [
                    { id: 'c1', userId: 'user1', userName: 'Alice', text: 'Great tips!', createdAt: '2026-01-10T10:00:00Z' }
                ],
                createdAt: '2026-01-10T08:00:00Z',
                updatedAt: null,
                isHardcoded: true
            },
            {
                id: 'hardcoded_2',
                userId: 'system',
                userName: 'BlogSphere Team',
                title: 'How to Stay Productive Every Day',
                category: 'Lifestyle',
                content: 'Productivity is not about doing more—it is about doing what matters. In this guide, we share practical tips to help you focus, eliminate distractions, and make the most of your day. From morning routines to time-blocking techniques, these strategies will help you achieve your goals with less stress.',
                likes: ['user1'],
                comments: [],
                createdAt: '2026-01-12T08:00:00Z',
                updatedAt: null,
                isHardcoded: true
            },
            {
                id: 'hardcoded_3',
                userId: 'system',
                userName: 'BlogSphere Team',
                title: 'Best Summer Destinations for 2026',
                category: 'Travel',
                content: 'Planning your summer vacation? We have rounded up the best destinations for 2026. From tropical beaches to mountain retreats, there is something for every type of traveler. Get insider tips on where to stay, what to eat, and the must-see attractions that will make your trip unforgettable.',
                likes: [],
                comments: [],
                createdAt: '2026-01-14T08:00:00Z',
                updatedAt: null,
                isHardcoded: true
            }
        ];
        localStorage.setItem('blog_hardcoded', JSON.stringify(hardcodedPosts));
    }
    
    // Get user posts
    const userPosts = JSON.parse(localStorage.getItem('blog_posts')) || [];
    
    // Combine both
    return [...hardcodedPosts, ...userPosts];
}

// Get posts by user ID
function getUserPosts(userId) {
    const allPosts = getAllPosts();
    return allPosts.filter(post => post.userId === userId && !post.isHardcoded);
}

// Get posts by category
function getPostsByCategory(category) {
    const allPosts = getAllPosts();
    return allPosts.filter(post => post.category === category);
}

// Toggle like on a post
function toggleLike(postId) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        alert('⚠️ Please login to like posts.');
        return;
    }

    let allPosts = getAllPosts();
    const postIndex = allPosts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
        alert('❌ Post not found.');
        return;
    }

    const post = allPosts[postIndex];
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
        post.likes.push(userId);
    } else {
        post.likes.splice(likeIndex, 1);
    }

    // Save back to localStorage
    const hardcodedPosts = allPosts.filter(p => p.isHardcoded);
    const userPosts = allPosts.filter(p => !p.isHardcoded);
    localStorage.setItem('blog_hardcoded', JSON.stringify(hardcodedPosts));
    localStorage.setItem('blog_posts', JSON.stringify(userPosts));
    
    return post.likes.length;
}

// Add comment to a post
function addComment(postId, commentText) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (!token || !userId) {
        alert('⚠️ Please login to comment.');
        return;
    }

    if (!commentText.trim()) {
        alert('⚠️ Please enter a comment.');
        return;
    }

    let allPosts = getAllPosts();
    const postIndex = allPosts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
        alert('❌ Post not found.');
        return;
    }

    const comment = {
        id: Date.now().toString(),
        userId: userId,
        userName: userName || 'User',
        text: commentText.trim(),
        createdAt: new Date().toISOString()
    };

    if (!allPosts[postIndex].comments) {
        allPosts[postIndex].comments = [];
    }
    allPosts[postIndex].comments.push(comment);

    // Save back to localStorage
    const hardcodedPosts = allPosts.filter(p => p.isHardcoded);
    const userPosts = allPosts.filter(p => !p.isHardcoded);
    localStorage.setItem('blog_hardcoded', JSON.stringify(hardcodedPosts));
    localStorage.setItem('blog_posts', JSON.stringify(userPosts));

    return comment;
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✅ Helper functions loaded');