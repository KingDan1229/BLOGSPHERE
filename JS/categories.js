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
//  CATEGORIES PAGE - JAVASCRIPT
//  ================================================================

// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {

    console.log('✅ Categories page loaded');

    // ============================================================
    //  STEP 1: GET CATEGORY FROM URL
    //  ============================================================
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    console.log('📂 Category from URL:', category);

    // If no category specified, show all posts (or redirect)
    if (!category) {
        document.getElementById('categoryTitle').textContent = 'All Posts';
        document.getElementById('categoryCount').textContent = 'Loading...';
    } else {
        document.getElementById('categoryTitle').textContent = category;
    }

    // ============================================================
    //  STEP 2: GET ALL POSTS
    //  ============================================================
    const allPosts = getAllPosts();
    console.log('📋 Total posts:', allPosts.length);

    // ============================================================
    //  STEP 3: FILTER POSTS BY CATEGORY
    //  ============================================================
    let filteredPosts = [];

    if (category) {
        // Filter by category
        filteredPosts = allPosts.filter(post => post.category === category);
    } else {
        // Show all posts if no category specified
        filteredPosts = allPosts;
    }

    console.log('📋 Filtered posts:', filteredPosts.length);

    // Update post count
    document.getElementById('categoryCount').textContent = filteredPosts.length + ' posts';

    // ============================================================
    //  STEP 4: RENDER POSTS
    //  ============================================================
    const container = document.getElementById('categoryPosts');

    if (filteredPosts.length === 0) {
        // No posts found
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h5>No posts found in this category</h5>
                    <p class="text-muted">Be the first to write something!</p>
                    <a href="./create.html" class="btn btn-primary mt-2">
                        <i class="bi bi-plus-circle"></i> Create Post
                    </a>
                </div>
            </div>
        `;
        return;
    }

    // Sort posts by newest first
    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Render each post
    container.innerHTML = filteredPosts.map(post => renderPostCard(post)).join('');

    // ============================================================
    //  STEP 5: ATTACH EVENT LISTENERS TO POSTS
    //  ============================================================
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.dataset.postId;
            const newCount = toggleLike(postId);
            
            if (newCount !== undefined) {
                // Update like count
                const countSpan = document.getElementById('likeCount_' + postId);
                if (countSpan) countSpan.textContent = newCount;
                
                // Toggle liked class
                this.classList.toggle('liked');
                const icon = this.querySelector('i');
                if (this.classList.contains('liked')) {
                    icon.className = 'bi bi-heart-fill';
                } else {
                    icon.className = 'bi bi-heart';
                }
            }
        });
    });

    // Comment buttons
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.dataset.postId;
            const input = document.getElementById('commentInput_' + postId);
            const text = input.value.trim();
            
            if (text) {
                const newComment = addComment(postId, text);
                if (newComment) {
                    // Reload comments section
                    loadComments(postId);
                    input.value = '';
                }
            } else {
                alert('⚠️ Please enter a comment.');
            }
        });
    });

    // Enter key on comment inputs
    document.querySelectorAll('.comment-input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const postId = this.dataset.postId;
                const btn = document.getElementById('commentBtn_' + postId);
                if (btn) btn.click();
            }
        });
    });

    console.log('✅ Categories page rendered successfully');
});

// ================================================================
//  RENDER POST CARD
//  ================================================================

function renderPostCard(post) {
    const isLoggedIn = localStorage.getItem('token') !== null;
    const currentUserId = localStorage.getItem('userId');
    
    const isLiked = post.likes && post.likes.includes(currentUserId);
    const likeCount = post.likes ? post.likes.length : 0;
    const commentCount = post.comments ? post.comments.length : 0;
    const isHardcoded = post.isHardcoded || false;

    // Build comments HTML
    let commentsHTML = '';
    if (post.comments && post.comments.length > 0) {
        commentsHTML = `
            <div class="comment-section mt-3" id="comments_${post.id}">
                <small class="text-muted d-block mb-2">
                    <i class="bi bi-chat"></i> ${post.comments.length} Comments
                </small>
                ${post.comments.map(c => `
                    <div class="comment-item d-flex gap-2 align-items-start">
                        <div class="comment-avatar">${c.userName.charAt(0).toUpperCase()}</div>
                        <div>
                            <small><strong>${escapeHTML(c.userName)}</strong></small>
                            <p class="mb-0 small">${escapeHTML(c.text)}</p>
                            <small class="text-muted" style="font-size: 0.65rem;">
                                ${new Date(c.createdAt).toLocaleDateString()}
                            </small>
                        </div>
                    </div>
                `).join('')}
                ${isLoggedIn ? `
                    <div class="input-group input-group-sm mt-2">
                        <input type="text" class="form-control comment-input" 
                               id="commentInput_${post.id}" 
                               data-post-id="${post.id}"
                               placeholder="Write a comment..." />
                        <button class="btn btn-primary btn-sm comment-btn" 
                                id="commentBtn_${post.id}"
                                data-post-id="${post.id}">
                            <i class="bi bi-send"></i>
                        </button>
                    </div>
                ` : `
                    <small class="text-muted d-block mt-2">
                        <a href="./signup.html">Login</a> to comment
                    </small>
                `}
            </div>
        `;
    } else {
        // No comments yet
        commentsHTML = `
            <div class="comment-section mt-3" id="comments_${post.id}">
                <small class="text-muted d-block mb-2">
                    <i class="bi bi-chat"></i> No comments yet
                </small>
                ${isLoggedIn ? `
                    <div class="input-group input-group-sm mt-2">
                        <input type="text" class="form-control comment-input" 
                               id="commentInput_${post.id}" 
                               data-post-id="${post.id}"
                               placeholder="Write a comment..." />
                        <button class="btn btn-primary btn-sm comment-btn" 
                                id="commentBtn_${post.id}"
                                data-post-id="${post.id}">
                            <i class="bi bi-send"></i>
                        </button>
                    </div>
                ` : `
                    <small class="text-muted d-block mt-2">
                        <a href="./signup.html">Login</a> to comment
                    </small>
                `}
            </div>
        `;
    }

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card post-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-primary tag">${post.category}</span>
                        ${isHardcoded ? '<span class="badge hardcoded-badge tag"><i class="bi bi-star-fill"></i> Featured</span>' : ''}
                    </div>
                    <h5 class="card-title">${escapeHTML(post.title)}</h5>
                    <p class="card-text text-muted small">
                        ${escapeHTML(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <small class="text-muted">
                                <i class="bi bi-person"></i> ${escapeHTML(post.userName)}
                            </small>
                            ${post.updatedAt ? '<span class="badge bg-warning text-dark ms-1" style="font-size: 0.6rem;"><i class="bi bi-pencil"></i> Edited</span>' : ''}
                        </div>
                        <small class="text-muted">${new Date(post.createdAt).toLocaleDateString()}</small>
                    </div>
                    <hr />
                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-sm btn-outline-danger like-btn ${isLiked ? 'liked' : ''}" 
                                data-post-id="${post.id}">
                            <i class="bi bi-heart${isLiked ? '-fill' : ''}"></i> 
                            <span id="likeCount_${post.id}">${likeCount}</span>
                        </button>
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="toggleComments('${post.id}')">
                            <i class="bi bi-chat"></i> ${commentCount}
                        </button>
                    </div>

                    <!-- Comments Section -->
                    <div class="collapse mt-2" id="commentsCollapse_${post.id}">
                        ${commentsHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ================================================================
//  TOGGLE COMMENTS VISIBILITY
//  ================================================================

function toggleComments(postId) {
    const commentsDiv = document.getElementById('commentsCollapse_' + postId);
    if (commentsDiv) {
        const isVisible = commentsDiv.classList.contains('show');
        if (isVisible) {
            commentsDiv.classList.remove('show');
        } else {
            commentsDiv.classList.add('show');
            // Load comments if not loaded
            loadComments(postId);
        }
    }
}

// ================================================================
//  LOAD COMMENTS FOR A POST
//  ================================================================

function loadComments(postId) {
    const posts = getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) return;
    
    // Rebuild comment section
    const container = document.getElementById('comments_' + postId);
    if (!container) return;
    
    const isLoggedIn = localStorage.getItem('token') !== null;
    const currentUserId = localStorage.getItem('userId');
    
    if (post.comments && post.comments.length > 0) {
        let commentsHTML = `
            <small class="text-muted d-block mb-2">
                <i class="bi bi-chat"></i> ${post.comments.length} Comments
            </small>
            ${post.comments.map(c => `
                <div class="comment-item d-flex gap-2 align-items-start">
                    <div class="comment-avatar">${c.userName.charAt(0).toUpperCase()}</div>
                    <div>
                        <small><strong>${escapeHTML(c.userName)}</strong></small>
                        <p class="mb-0 small">${escapeHTML(c.text)}</p>
                        <small class="text-muted" style="font-size: 0.65rem;">
                            ${new Date(c.createdAt).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            `).join('')}
            ${isLoggedIn ? `
                <div class="input-group input-group-sm mt-2">
                    <input type="text" class="form-control comment-input" 
                           id="commentInput_${postId}" 
                           data-post-id="${postId}"
                           placeholder="Write a comment..." />
                    <button class="btn btn-primary btn-sm comment-btn" 
                            id="commentBtn_${postId}"
                            data-post-id="${postId}">
                        <i class="bi bi-send"></i>
                    </button>
                </div>
            ` : `
                <small class="text-muted d-block mt-2">
                    <a href="./signup.html">Login</a> to comment
                </small>
            `}
        `;
        container.innerHTML = commentsHTML;
    } else {
        container.innerHTML = `
            <small class="text-muted d-block mb-2">
                <i class="bi bi-chat"></i> No comments yet
            </small>
            ${isLoggedIn ? `
                <div class="input-group input-group-sm mt-2">
                    <input type="text" class="form-control comment-input" 
                           id="commentInput_${postId}" 
                           data-post-id="${postId}"
                           placeholder="Write a comment..." />
                    <button class="btn btn-primary btn-sm comment-btn" 
                            id="commentBtn_${postId}"
                            data-post-id="${postId}">
                        <i class="bi bi-send"></i>
                    </button>
                </div>
            ` : `
                <small class="text-muted d-block mt-2">
                    <a href="./signup.html">Login</a> to comment
                </small>
            `}
        `;
    }
    
    // Re-attach comment button listener
    const commentBtn = document.getElementById('commentBtn_' + postId);
    if (commentBtn) {
        commentBtn.addEventListener('click', function() {
            const pid = this.dataset.postId;
            const input = document.getElementById('commentInput_' + pid);
            const text = input.value.trim();
            
            if (text) {
                const newComment = addComment(pid, text);
                if (newComment) {
                    loadComments(pid);
                    input.value = '';
                }
            } else {
                alert('⚠️ Please enter a comment.');
            }
        });
    }
    
    // Re-attach enter key listener
    const commentInput = document.getElementById('commentInput_' + postId);
    if (commentInput) {
        commentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const pid = this.dataset.postId;
                const btn = document.getElementById('commentBtn_' + pid);
                if (btn) btn.click();
            }
        });
    }
}

// ================================================================
//  HELPER FUNCTIONS (FROM create.js)
//  ================================================================

// Get all posts from LocalStorage (hardcoded + user posts)
function getAllPosts() {
    // Get hardcoded posts from localStorage (if stored) or use default
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
    
    // Get user posts from localStorage
    const userPosts = JSON.parse(localStorage.getItem('blog_posts')) || [];
    
    // Combine both
    return [...hardcodedPosts, ...userPosts];
}

// Toggle like on a post
function toggleLike(postId) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        alert('⚠️ Please login to like posts.');
        return;
    }

    let posts = getAllPosts();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
        alert('❌ Post not found.');
        return;
    }

    const post = posts[postIndex];
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
        post.likes.push(userId);
    } else {
        post.likes.splice(likeIndex, 1);
    }

    // Save back to localStorage
    const hardcodedPosts = posts.filter(p => p.isHardcoded);
    const userPosts = posts.filter(p => !p.isHardcoded);
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

    let posts = getAllPosts();
    const postIndex = posts.findIndex(p => p.id === postId);

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

    if (!posts[postIndex].comments) {
        posts[postIndex].comments = [];
    }
    posts[postIndex].comments.push(comment);

    // Save back to localStorage
    const hardcodedPosts = posts.filter(p => p.isHardcoded);
    const userPosts = posts.filter(p => !p.isHardcoded);
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

console.log('✅ Categories helper functions loaded');
