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

/* ---------------------- HEALTHCHECK ---------------------- */
app.get("/", (req, res) => {
  res.send("Backend Live");
});

/* ---------------------- CORS ---------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------- __dirname fix ---------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------------- File Uploads ---------------------- */
const localUpload = multer({ dest: path.join(__dirname, "uploads") });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------------- Test Route ---------------------- */
app.get("/api/test", (req, res) => {
  res.json({ message: "Wrong Turn backend working 🚀" });
});

/* ---------------------- ADMIN ROUTES ---------------------- */
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/packages", adminPackageRoutes);

/* ---------------------- PUBLIC ROUTES ---------------------- */
app.get("/api/packages", async (req, res) => {
  try {
    const pkgs = await Package.find().sort({ createdAt: -1 });
    res.json(pkgs);
  } catch (err) {
    res.status(500).json({ msg: "Error loading packages", error: err.message });
  }
});

/* ---------------------- Start Server (FIXED) ---------------------- */
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(PORT, () =>
      console.log(`🚀 Wrong Turn backend running on port ${PORT}`)
    );

  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
