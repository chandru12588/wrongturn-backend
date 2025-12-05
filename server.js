import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

import adminAuthRoutes from "./routes/adminAuth.js";

import adminPackageRoutes from "./routes/adminPackages.js";

dotenv.config();
const app = express();

/* ---------------------- CORS ---------------------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------- __dirname fix ---------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------------- Connect MongoDB ---------------------- */
await connectDB();

/* ---------------------- File Uploads (for Booking only) ---------------------- */
const localUpload = multer({ dest: path.join(__dirname, "uploads") });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------------- Test Route ---------------------- */
app.get("/api/test", (req, res) => {
  res.json({ message: "Wrong Turn backend working 🚀" });
});

/* ---------------------- Booking Route (Keep existing) ---------------------- */
app.post("/api/book", localUpload.single("idFile"), (req, res) => {
  try {
    console.log("Booking Received");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    res.json({
      success: true,
      id: "BK-" + Date.now(),
      filePath: `/uploads/${req.file.filename}`,
      message: "Booking stored successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------- Admin Routes (NEW) ---------------------- */
// Login
app.use("/api/admin/auth", adminAuthRoutes);

// Packages CRUD
app.use("/api/admin/packages", adminPackageRoutes);

/* ---------------------- Start Server ---------------------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Wrong Turn backend running on port ${PORT} 🚀`)
);
