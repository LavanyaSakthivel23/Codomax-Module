
// ==========================================
// BLOGSPACE - FRONTEND JAVASCRIPT
// ==========================================

const API_URL = "http://localhost:5000/api";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function showMessage(message, type = "success") {
    alert(message);
}

function getToken() {
    return localStorage.getItem("token");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}

async function getResponseData(response) {
    return await response.json();
}

// ==========================================
// REGISTER
// ==========================================

async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await getResponseData(response);

        if (!response.ok) {
            return showMessage(data.message || "Registration failed");
        }

        showMessage("Registration successful! Please login.");
        window.location.href = "login.html";

    } catch (error) {
        showMessage("Unable to connect to server.");
    }
}

// ==========================================
// LOGIN
// ==========================================

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await getResponseData(response);

        if (!response.ok) {
            return showMessage(data.message || "Login failed");
        }

        localStorage.setItem("token", data.token);

        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        showMessage("Login successful!");
        window.location.href = "create-blog.html";

    } catch (error) {
        showMessage("Unable to connect to server.");
    }
}

// ==========================================
// CREATE BLOG
// ==========================================

async function createBlog(event) {
    event.preventDefault();

    const title = document.getElementById("blogTitle").value.trim();
    const content = document.getElementById("blogContent").value.trim();

    if (!getToken()) {
        showMessage("Please login first.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/blogs/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ title, content })
        });

        const data = await getResponseData(response);

        if (!response.ok) {
            return showMessage(data.message || "Blog publishing failed");
        }

        showMessage("Blog published successfully!");
        window.location.href = "dashboard.html";

    } catch (error) {
        showMessage("Unable to connect to server.");
    }
}

// ==========================================
// READ - LOAD ALL BLOGS
// ==========================================

async function loadBlogs() {
    const blogContainer = document.getElementById("myBlogs");

    if (!blogContainer) return;

    blogContainer.innerHTML = "Loading blogs...";

    try {
        const response = await fetch(`${API_URL}/blogs`);
        const data = await getResponseData(response);

        if (!response.ok) {
            blogContainer.innerHTML = "Unable to load blogs.";
            return;
        }

        const blogs = data.blogs || [];

        if (blogs.length === 0) {
            blogContainer.innerHTML = "<p>No blogs available yet.</p>";
            return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "null");
        const currentUserId = user ? String(user._id || user.id || "") : "";

        blogContainer.innerHTML = blogs.map(blog => {
            const authorId = blog.author
                ? String(blog.author._id || blog.author)
                : "";

            const isOwner = currentUserId && authorId === currentUserId;

            return `
                <div class="blog-card">
                    <h3>${escapeHTML(blog.title)}</h3>
                    <p>By: ${escapeHTML(blog.author?.name || "Unknown")}</p>
                    <p>${escapeHTML(
                        blog.content.substring(0, 150)
                    )}...</p>

                    <a class="btn"
                       href="blog-details.html?id=${encodeURIComponent(blog._id)}">
                       Read More
                    </a>

                    ${isOwner ? `
                        <div class="blog-actions">
                            <a class="edit-btn"
                               href="edit-blog.html?id=${encodeURIComponent(blog._id)}">
                               Edit
                            </a>

                            <button class="delete-btn"
                                onclick="deleteBlog('${blog._id}')">
                                Delete
                            </button>
                        </div>
                    ` : ""}
                </div>
            `;
        }).join("");

    } catch (error) {
        blogContainer.innerHTML = "<p>Error loading blogs.</p>";
    }
}

// ==========================================
// UPDATE - LOAD SELECTED BLOG FOR EDITING
// ==========================================

async function loadEditBlog() {
    const titleInput = document.getElementById("editTitle");
    const contentInput = document.getElementById("editContent");

    if (!titleInput || !contentInput) return;

    if (!getToken()) {
        showMessage("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const blogId = new URLSearchParams(window.location.search).get("id");

    if (!blogId) {
        showMessage("Blog ID is missing.");
        window.location.href = "dashboard.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/blogs`);
        const data = await getResponseData(response);

        if (!response.ok) {
            throw new Error(data.message || "Unable to fetch blogs");
        }

        const blog = (data.blogs || []).find(item => item._id === blogId);

        if (!blog) {
            showMessage("Blog not found.");
            window.location.href = "dashboard.html";
            return;
        }

        titleInput.value = blog.title;
        contentInput.value = blog.content;

    } catch (error) {
        showMessage(error.message || "Unable to load blog.");
    }
}

// ==========================================
// UPDATE - SAVE BLOG CHANGES
// ==========================================

async function updateBlog(event) {
    event.preventDefault();

    const blogId = new URLSearchParams(window.location.search).get("id");
    const title = document.getElementById("editTitle").value.trim();
    const content = document.getElementById("editContent").value.trim();

    if (!title || !content) {
        showMessage("Please enter both title and content.");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/blogs/${encodeURIComponent(blogId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({ title, content })
            }
        );

        const data = await getResponseData(response);

        if (!response.ok) {
            return showMessage(data.message || "Blog update failed.");
        }

        showMessage("Blog updated successfully!");
        window.location.href = "dashboard.html";

    } catch (error) {
        showMessage("Unable to connect to server.");
    }
}

// ==========================================
// DELETE BLOG
// ==========================================

async function deleteBlog(blogId) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this blog?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(
            `${API_URL}/blogs/${encodeURIComponent(blogId)}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            }
        );

        const data = await getResponseData(response);

        if (!response.ok) {
            return showMessage(data.message || "Blog deletion failed.");
        }

        showMessage("Blog deleted successfully!");
        loadBlogs();

    } catch (error) {
        showMessage("Unable to connect to server.");
    }
}

// ==========================================
// LOGOUT
// ==========================================

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// ==========================================
// PAGE LOADING
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("myBlogs")) {
        loadBlogs();
    }

    if (document.getElementById("editBlogForm")) {
        loadEditBlog();
    }
});

// ==========================================
// SEARCH BLOGS
// ==========================================

function searchBlogs() {
    const searchInput = document.getElementById("searchBlogs");
    const searchText = searchInput.value.toLowerCase().trim();

    const blogCards = document.querySelectorAll("#myBlogs .blog-card");

    blogCards.forEach(card => {
        const blogText = card.textContent.toLowerCase();

        if (blogText.includes(searchText)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}
