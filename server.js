
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Import routes
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blogs");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files (HTML, CSS and JavaScript)
app.use(express.static(__dirname));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        message: "BlogSpace API is working successfully!"
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`BlogSpace server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
