
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
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return { message: text || "Unexpected server response." };
    }
}

// ==========================================
// 1. USER REGISTRATION
// ==========================================

async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await getResponseData(response);

        if (!response.ok) {
            throw new Error(data.message || "Registration failed.");
        }

        showMessage("Registration successful! Please log in.");

        window.location.href = "login.html";

    } catch (error) {
        console.error("Registration error:", error);
        showMessage(error.message || "Unable to register. Check your server.");
    }
}

// ==========================================
// 2. USER LOGIN
// ==========================================

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showMessage("Please enter your email and password.", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await getResponseData(response);

        if (!response.ok) {
            throw new Error(data.message || "Login failed.");
        }

        if (!data.token) {
            throw new Error("Login succeeded but the server did not return a token.");
        }

        localStorage.setItem("token", data.token);

        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        showMessage("Login successful! Welcome to BlogSpace.");

        window.location.href = "create-blog.html";

    } catch (error) {
        console.error("Login error:", error);
        showMessage(error.message || "Unable to log in. Check your server.");
    }
}

// ==========================================
// 3. CREATE / PUBLISH BLOG
// ==========================================

async function createBlog(event) {
    event.preventDefault();

    const titleInput = document.getElementById("blogTitle");
    const contentInput = document.getElementById("blogContent");

    if (!titleInput || !contentInput) {
        showMessage("Blog form fields could not be found.", "error");
        return;
    }

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        showMessage("Please enter both a blog title and content.", "error");
        return;
    }

    const token = getToken();

    if (!token) {
        showMessage("Please log in before publishing a blog.");
        window.location.href = "login.html";
        return;
    }

    const publishButton = document.querySelector(
        'button[type="submit"]'
    );

    if (publishButton) {
        publishButton.disabled = true;
        publishButton.textContent = "Publishing...";
    }

    try {
        const response = await fetch(`${API_URL}/blogs/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                content
            })
        });

        const data = await getResponseData(response);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                throw new Error("Your login session has expired. Please log in again.");
            }

            throw new Error(data.message || "Blog publishing failed.");
        }

        showMessage("Your blog has been published successfully!");

        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Blog publishing error:", error);
        showMessage(error.message || "Unable to publish your blog.");

        if (publishButton) {
            publishButton.disabled = false;
            publishButton.textContent = "Publish Blog";
        }
    }
}

// ==========================================
// 4. DISPLAY ALL BLOGS ON DASHBOARD
// ==========================================

async function loadBlogs() {
    const container = document.getElementById("myBlogs");

    if (!container) {
        return;
    }

    container.innerHTML = "<p>Loading blogs...</p>";

    try {
        const response = await fetch(`${API_URL}/blogs`);
        const data = await getResponseData(response);

        if (!response.ok) {
            throw new Error(data.message || "Unable to load blogs.");
        }

        const blogs = Array.isArray(data)
            ? data
            : (data.blogs || []);

        if (blogs.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:30px;">
                    <h3>No blogs published yet.</h3>
                    <p>Be the first to share a story!</p>
                    <a href="create-blog.html">Create your first blog</a>
                </div>
            `;
            return;
        }

        container.innerHTML = blogs.map(blog => {
            const authorName = blog.author?.name || "BlogSpace Author";

            const date = blog.createdAt
                ? new Date(blog.createdAt).toLocaleDateString()
                : "";

            const preview = String(blog.content || "").slice(0, 150);

            return `
                <article style="
                    background:white;
                    padding:22px;
                    margin:15px 0;
                    border-radius:14px;
                    box-shadow:0 5px 20px rgba(20,43,83,0.08);
                ">
                    <h3 style="color:#172c52; margin-bottom:10px;">
                        ${escapeHTML(blog.title)}
                    </h3>

                    <p style="color:#64748b; line-height:1.7;">
                        ${escapeHTML(preview)}${blog.content?.length > 150 ? "..." : ""}
                    </p>

                    <p style="font-size:12px; color:#8592a7; margin:12px 0;">
                        By ${escapeHTML(authorName)}
                        ${date ? " | " + escapeHTML(date) : ""}
                    </p>

                    <a href="blog-details.html?id=${encodeURIComponent(blog._id)}"
                       style="
                           display:inline-block;
                           padding:10px 18px;
                           background:#397ce7;
                           color:white;
                           text-decoration:none;
                           border-radius:8px;
                           font-size:13px;
                           font-weight:bold;
                       ">
                        Read More →
                    </a>
                </article>
            `;
        }).join("");

    } catch (error) {
        console.error("Loading blogs error:", error);

        container.innerHTML = `
            <p style="color:#dc2626;">
                Unable to load blogs. Please refresh the page.
            </p>
        `;
    }
}

// ==========================================
// 5. LOGOUT
// ==========================================

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    showMessage("You have logged out successfully.");

    window.location.href = "login.html";
}

// ==========================================
// 6. LOAD DASHBOARD BLOGS WHEN PAGE OPENS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("myBlogs")) {
        loadBlogs();
    }
});
