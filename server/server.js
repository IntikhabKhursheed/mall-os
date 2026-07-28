require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const departmentRoutes = require("./src/routes/departmentRoutes");
const productRoutes = require("./src/routes/productRoutes");
const posRoutes = require("./src/routes/posRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const errorMiddleware = require("./src/middleware/errorMiddleware");

const app = express();
const port = process.env.PORT || 5000;

// Build the allowed origins list dynamically so Vercel env vars are picked up
const allowedOrigins = new Set(
  [process.env.CLIENT_URL, "http://localhost:4200", "http://localhost:4201"].filter(Boolean)
);

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json());

// Health check (no DB required)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MallOS API is running",
    dbState: mongoose.connection.readyState,
  });
});

// Lazy DB connect middleware – ensures Vercel cold starts reconnect to MongoDB
app.use("/api", async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error("DB connection error in middleware:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

// In Vercel's serverless environment, we export app and do NOT call listen().
// Locally (NODE_ENV=development or no VERCEL env var), start the server normally.
if (process.env.VERCEL !== "1") {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Database connection failed:", error.message);
      process.exit(1);
    });
}

module.exports = app;
