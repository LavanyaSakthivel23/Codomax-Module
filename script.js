
const API_URL = "http://localhost:5000/api";

// REGISTER USER
async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed");
            return;
        }

        alert("Registration successful! Please login.");
        window.location.href = "login.html";

    } catch (error) {
        alert("Unable to connect to the server.");
        console.error(error);
    }
}

// LOGIN USER
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed");
            return;
        }

        localStorage.setItem("blogToken", data.token);
        localStorage.setItem("blogUser", JSON.stringify(data.user));

        alert("Login successful!");
        window.location.href = "dashboard.html";

    } catch (error) {
        alert("Unable to connect to the server.");
        console.error(error);
    }
}

// CREATE BLOG
async function createBlog(event) {
    event.preventDefault();

    const title = document.getElementById("blogTitle").value;
    const content = document.getElementById("blogContent").value;
    const token = localStorage.getItem("blogToken");

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/blogs/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Blog creation failed");
            return;
        }

        alert("Blog published successfully!");
        window.location.href = "dashboard.html";

    } catch (error) {
        alert("Unable to connect to the server.");
        console.error(error);
    }
}

// DISPLAY BLOGS
async function displayBlogs() {
    const blogContainer = document.getElementById("myBlogs");

    if (!blogContainer) return;

    try {
        const response = await fetch(`${API_URL}/blogs`);
        const data = await response.json();

        if (!response.ok) {
            blogContainer.textContent = "Unable to load blogs.";
            return;
        }

        const user = JSON.parse(localStorage.getItem("blogUser") || "null");

        blogContainer.innerHTML = "";

        const blogs = data.blogs || [];

        if (blogs.length === 0) {
            blogContainer.textContent = "No blogs published yet.";
            return;
        }

        blogs.forEach(blog => {
            const card = document.createElement("div");
            card.className = "blog-card";

            const title = document.createElement("h3");
            title.textContent = blog.title;

            const content = document.createElement("p");
            content.textContent = blog.content;

            const author = document.createElement("p");
            author.textContent = "By: " + (blog.author?.name || "Unknown");

            const date = document.createElement("small");
            date.textContent = new Date(blog.createdAt).toLocaleDateString();

            card.append(title, content, author, date);
            blogContainer.appendChild(card);
        });

    } catch (error) {
        blogContainer.textContent = "Unable to connect to the server.";
        console.error(error);
    }
}

// LOGOUT USER
function logoutUser() {
    localStorage.removeItem("blogToken");
    localStorage.removeItem("blogUser");

    alert("Logged out successfully!");
    window.location.href = "login.html";
}

// RUN DASHBOARD BLOG DISPLAY
document.addEventListener("DOMContentLoaded", displayBlogs);
