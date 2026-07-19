// ================================================================
//  CATEGORIES PAGE - WITH EXPANDABLE "READ MORE"
//  ================================================================

document.addEventListener('DOMContentLoaded', function() {

    console.log('✅ Categories page loaded');

    // ============================================================
    //  GET CATEGORY FROM URL
    //  ============================================================
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    console.log('📂 Category from URL:', category);

    if (!category) {
        document.getElementById('categoryTitle').textContent = 'All Posts';
        document.getElementById('categoryCount').textContent = 'Loading...';
    } else {
        document.getElementById('categoryTitle').textContent = category;
    }

    // ============================================================
    //  GET ALL POSTS
    //  ============================================================
    function getAllPosts() {
        // Hardcoded posts
        let hardcodedPosts = JSON.parse(localStorage.getItem('blog_hardcoded')) || [];
        if (hardcodedPosts.length === 0) {
            hardcodedPosts = [
                {
                    id: 'hardcoded_1',
                    userId: 'system',
                    userName: 'BlogSphere Team',
                    title: 'Top 5 Tips for Web Development in 2026',
                    category: 'Technology',
                    content: 'Web development is constantly evolving. In this article, we explore the top 5 tips that every developer should know in 2026. From responsive design principles to performance optimization, we cover it all. Whether you are a beginner or a seasoned pro, these tips will help you level up your skills and build better websites. Learn about the latest frameworks, best practices for accessibility, and how to stay ahead of the curve in this fast-paced industry.',
                    likes: ['user1', 'user2'],
                    comments: [{ id: 'c1', userId: 'user1', userName: 'Alice', text: 'Great tips!', createdAt: '2026-01-10T10:00:00Z' }],
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
                    content: 'Productivity is not about doing more—it is about doing what matters. In this guide, we share practical tips to help you focus, eliminate distractions, and make the most of your day. From morning routines to time-blocking techniques, these strategies will help you achieve your goals with less stress. Discover how to create a productive workspace, manage your energy levels, and build habits that stick.',
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
                    content: 'Planning your summer vacation? We have rounded up the best destinations for 2026. From tropical beaches to mountain retreats, there is something for every type of traveler. Get insider tips on where to stay, what to eat, and the must-see attractions that will make your trip unforgettable. Explore hidden gems and popular hotspots alike with our comprehensive travel guide.',
                    likes: [],
                    comments: [],
                    createdAt: '2026-01-14T08:00:00Z',
                    updatedAt: null,
                    isHardcoded: true
                }
            ];
            localStorage.setItem('blog_hardcoded', JSON.stringify(hardcodedPosts));
        }

        // User posts
        const userPosts = JSON.parse(localStorage.getItem('blog_posts')) || [];
        return [...hardcodedPosts, ...userPosts];
    }

    const allPosts = getAllPosts();
    console.log('📋 Total posts:', allPosts.length);

    // ============================================================
    //  FILTER POSTS BY CATEGORY
    //  ============================================================
    let filteredPosts = category 
        ? allPosts.filter(post => post.category === category) 
        : allPosts;

    console.log('📋 Filtered posts:', filteredPosts.length);

    document.getElementById('categoryCount').textContent = filteredPosts.length + ' posts';

    // ============================================================
    //  RENDER POSTS WITH EXPANDABLE READ MORE
    //  ============================================================
    const container = document.getElementById('categoryPosts');

    if (filteredPosts.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state text-center py-5">
                    <i class="bi bi-inbox display-1 text-muted"></i>
                    <h5 class="mt-3 text-muted">No posts found in "${category || 'this category'}"</h5>
                    <p class="text-muted">Be the first to write something!</p>
                    <a href="./create.html" class="btn btn-primary mt-2">
                        <i class="bi bi-plus-circle"></i> Create Post
                    </a>
                </div>
            </div>
        `;
        return;
    }

    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = filteredPosts.map(post => renderPostCard(post)).join('');

    // ============================================================
    //  ATTACH EVENT LISTENERS
    //  ============================================================
    attachEventListeners();

    console.log('✅ Categories page rendered successfully');
});

// ================================================================
//  RENDER POST CARD WITH EXPANDABLE READ MORE
//  ================================================================
function renderPostCard(post) {
    const isLoggedIn = localStorage.getItem('token') !== null;
    const currentUserId = localStorage.getItem('userId');

    const isLiked = post.likes && post.likes.includes(currentUserId);
    const likeCount = post.likes ? post.likes.length : 0;
    const commentCount = post.comments ? post.comments.length : 0;
    const isHardcoded = post.isHardcoded || false;

    // Preview text (first 150 characters)
    const previewText = post.content.substring(0, 150);
    const fullText = post.content;
    const hasMore = post.content.length > 150;

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card post-card h-100">
                <div class="card-body">
                    <!-- Category & Featured Badge -->
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge bg-primary tag">${escapeHTML(post.category)}</span>
                        ${isHardcoded ? '<span class="badge hardcoded-badge tag"><i class="bi bi-star-fill"></i> Featured</span>' : ''}
                    </div>

                    <!-- Title -->
                    <h5 class="card-title">${escapeHTML(post.title)}</h5>

                    <!-- Author & Date -->
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <small class="text-muted">
                                <i class="bi bi-person"></i> ${escapeHTML(post.userName)}
                            </small>
                            ${post.updatedAt ? '<span class="badge bg-warning text-dark ms-1" style="font-size:0.6rem;"><i class="bi bi-pencil"></i> Edited</span>' : ''}
                        </div>
                        <small class="text-muted">${new Date(post.createdAt).toLocaleDateString()}</small>
                    </div>

                    <!-- Content Preview -->
                    <div class="post-content">
                        <p class="card-text text-muted small post-preview" id="preview_${post.id}">
                            ${escapeHTML(previewText)}${hasMore ? '...' : ''}
                        </p>
                        
                        <!-- Full Content (hidden by default) -->
                        <div class="post-full-content collapse" id="fullContent_${post.id}">
                            <p class="card-text text-muted small">${escapeHTML(fullText)}</p>
                        </div>
                    </div>

                    <!-- Read More / Read Less Button -->
                    ${hasMore ? `
                        <button class="btn btn-sm btn-outline-primary read-more-btn mt-2" 
                                data-post-id="${post.id}"
                                onclick="toggleReadMore('${post.id}')">
                            <i class="bi bi-chevron-down"></i> Read More
                        </button>
                    ` : ''}

                    <hr />

                    <!-- Actions: Like & Comment -->
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
                        <div class="comment-section" id="comments_${post.id}">
                            <small class="text-muted d-block mb-2"><i class="bi bi-chat"></i> Loading comments...</small>
                        </div>
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

                </div>
            </div>
        </div>
    `;
}

// ================================================================
//  TOGGLE READ MORE / READ LESS
//  ================================================================
function toggleReadMore(postId) {
    const fullContent = document.getElementById('fullContent_' + postId);
    const preview = document.getElementById('preview_' + postId);
    const btn = document.querySelector(`.read-more-btn[data-post-id="${postId}"]`);

    if (!fullContent || !btn) return;

    if (fullContent.classList.contains('show')) {
        // Collapse
        fullContent.classList.remove('show');
        if (preview) preview.style.display = 'block';
        btn.innerHTML = '<i class="bi bi-chevron-down"></i> Read More';
    } else {
        // Expand
        fullContent.classList.add('show');
        if (preview) preview.style.display = 'none';
        btn.innerHTML = '<i class="bi bi-chevron-up"></i> Read Less';
    }
}

// ================================================================
//  TOGGLE COMMENTS
//  ================================================================
function toggleComments(postId) {
    const commentsDiv = document.getElementById('commentsCollapse_' + postId);
    if (commentsDiv) {
        commentsDiv.classList.toggle('show');
        if (commentsDiv.classList.contains('show')) {
            loadComments(postId);
        }
    }
}

// ================================================================
//  LOAD COMMENTS
//  ================================================================
function loadComments(postId) {
    const posts = getAllPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const container = document.getElementById('comments_' + postId);
    if (!container) return;

    if (post.comments && post.comments.length > 0) {
        container.innerHTML = `
            <small class="text-muted d-block mb-2"><i class="bi bi-chat"></i> ${post.comments.length} Comments</small>
            ${post.comments.map(c => `
                <div class="comment-item d-flex gap-2 align-items-start">
                    <div class="comment-avatar">${c.userName.charAt(0).toUpperCase()}</div>
                    <div>
                        <small><strong>${escapeHTML(c.userName)}</strong></small>
                        <p class="mb-0 small">${escapeHTML(c.text)}</p>
                        <small class="text-muted" style="font-size:0.65rem;">${new Date(c.createdAt).toLocaleDateString()}</small>
                    </div>
                </div>
            `).join('')}
        `;
    } else {
        container.innerHTML = `<small class="text-muted d-block mb-2"><i class="bi bi-chat"></i> No comments yet</small>`;
    }
}

// ================================================================
//  ATTACH EVENT LISTENERS
//  ================================================================
function attachEventListeners() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.dataset.postId;
            const newCount = toggleLike(postId);
            if (newCount !== undefined) {
                document.getElementById('likeCount_' + postId).textContent = newCount;
                this.classList.toggle('liked');
                const icon = this.querySelector('i');
                icon.className = this.classList.contains('liked') ? 'bi bi-heart-fill' : 'bi bi-heart';
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
}

// ================================================================
//  HELPER FUNCTIONS
//  ================================================================

function getAllPosts() {
    let hardcodedPosts = JSON.parse(localStorage.getItem('blog_hardcoded')) || [];
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
                comments: [{ id: 'c1', userId: 'user1', userName: 'Alice', text: 'Great tips!', createdAt: '2026-01-10T10:00:00Z' }],
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
                content: 'Productivity is not about doing more—it is about doing what matters. In this guide, we share practical tips to help you focus, eliminate distractions, and make the most of your day.',
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
                content: 'Planning your summer vacation? We have rounded up the best destinations for 2026. From tropical beaches to mountain retreats, there is something for every type of traveler.',
                likes: [],
                comments: [],
                createdAt: '2026-01-14T08:00:00Z',
                updatedAt: null,
                isHardcoded: true
            }
        ];
        localStorage.setItem('blog_hardcoded', JSON.stringify(hardcodedPosts));
    }
    const userPosts = JSON.parse(localStorage.getItem('blog_posts')) || [];
    return [...hardcodedPosts, ...userPosts];
}

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
    likeIndex === -1 ? post.likes.push(userId) : post.likes.splice(likeIndex, 1);

    const hardcodedPosts = allPosts.filter(p => p.isHardcoded);
    const userPosts = allPosts.filter(p => !p.isHardcoded);
    localStorage.setItem('blog_hardcoded', JSON.stringify(hardcodedPosts));
    localStorage.setItem('blog_posts', JSON.stringify(userPosts));

    return post.likes.length;
}

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

    if (!allPosts[postIndex].comments) allPosts[postIndex].comments = [];
    allPosts[postIndex].comments.push(comment);

    const hardcodedPosts = allPosts.filter(p => p.isHardcoded);
    const userPosts = allPosts.filter(p => !p.isHardcoded);
    localStorage.setItem('blog_hardcoded', JSON.stringify(hardcodedPosts));
    localStorage.setItem('blog_posts', JSON.stringify(userPosts));

    return comment;
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✅ categories.js loaded');