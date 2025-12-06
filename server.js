import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

import adminAuthRoutes from "./routes/adminAuth.js";
import adminPackageRoutes from "./routes/adminPackages.js";
import Package from "./models/Package.js";

dotenv.config();
const app = express();

/* ---------------------- HEALTH CHECK ---------------------- */
app.get("/", (req, res) => {
  return res.status(200).send("Backend Live");
});

/* ---------------------- CORS ---------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://wrongturn-frontend.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* ---------------------- BODY PARSERS ---------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------- __dirname FIX ---------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------------- STATIC UPLOADS ---------------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------------- ROUTES ---------------------- */
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/packages", adminPackageRoutes);

/* Public route: get packages */
app.get("/api/packages", async (req, res) => {
  try {
    const pkgs = await Package.find().sort({ createdAt: -1 });
    res.json(pkgs);
  } catch (err) {
    res.status(500).json({ msg: "Error loading packages" });
  }
});

/* Public route: get single package */
app.get("/api/packages/:id", async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ msg: "Package not found" });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ msg: "Error loading package" });
  }
});

/* ---------------------- START SERVER ---------------------- */
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();   // Connect ONCE only
    console.log("MongoDB connected");

    app.listen(PORT, () =>
      console.log(`🚀 Wrong Turn backend running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

startServer();
