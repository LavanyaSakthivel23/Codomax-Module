
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

// UPDATE A BLOG
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Please enter title and content"
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        // Only the blog author can update it
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to update this blog"
            });
        }

        blog.title = title;
        blog.content = content;

        await blog.save();

        res.status(200).json({
            message: "Blog updated successfully!",
            blog
        });

    } catch (error) {
        res.status(500).json({
            message: "Blog update failed",
            error: error.message
        });
    }
});

// DELETE A BLOG
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        // Only the blog author can delete it
        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to delete this blog"
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Blog deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Blog deletion failed",
            error: error.message
        });
    }
});

module.exports = router;
