
const express = require("express");
const Blog = require("../models/Blog");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// CREATE A NEW BLOG
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Please enter title and content"
            });
        }

        const newBlog = await Blog.create({
            title,
            content,
            author: req.user.id
        });

        res.status(201).json({
            message: "Blog created successfully!",
            blog: newBlog
        });

    } catch (error) {
        res.status(500).json({
            message: "Blog creation failed",
            error: error.message
        });
    }
});

// GET ALL BLOGS
router.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Blogs fetched successfully!",
            blogs
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch blogs",
            error: error.message
        });
    }
});

module.exports = router;
