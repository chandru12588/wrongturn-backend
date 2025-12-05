import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "cloudinary";
import Package from "../models/Package.js";
import { requireAdmin } from "../middleware/auth.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();
const upload = multer();

/* ---------------- ADMIN: GET ALL ---------------- */
router.get("/", requireAdmin, async (req, res) => {
  const pkgs = await Package.find().sort({ createdAt: -1 });
  res.json(pkgs);
});

/* ---------------- ADMIN: GET ONE (fixes EDIT page) ---------------- */
router.get("/:id", requireAdmin, async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) return res.status(404).json({ msg: "Package not found" });
  res.json(pkg);
});

/* ---------------- ADMIN: CREATE ---------------- */
router.post("/", requireAdmin, upload.array("images", 8), async (req, res) => {
  try {
    const body = JSON.parse(req.body.data || "{}");

    const uploadedImgs = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const uploadRes = await new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            { folder: "wrongturn/packages" },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        uploadedImgs.push(uploadRes.secure_url);
      }
    }

    const slug = body.title.toLowerCase().replace(/\s+/g, "-");

    const pkg = await Package.create({
      ...body,
      images: uploadedImgs,
      slug,
    });

    res.json(pkg);
  } catch (err) {
    res.status(500).json({ msg: "Create failed", error: err.message });
  }
});

/* ---------------- ADMIN: UPDATE ---------------- */
router.put("/:id", requireAdmin, upload.array("images", 8), async (req, res) => {
  try {
    const body = JSON.parse(req.body.data || "{}");
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ msg: "Package not found" });

    if (req.files?.length) {
      const addedImgs = [];
      for (const file of req.files) {
        const uploadRes = await new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            { folder: "wrongturn/packages" },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        addedImgs.push(uploadRes.secure_url);
      }

      body.images = [...pkg.images, ...addedImgs];
    }

    Object.assign(pkg, body);
    await pkg.save();
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ msg: "Update failed", error: err.message });
  }
});

/* ---------------- ADMIN: DELETE ---------------- */
router.delete("/:id", requireAdmin, async (req, res) => {
  await Package.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ---------------- PUBLIC: GET ALL ---------------- */
router.get("/public/all", async (req, res) => {
  const pkgs = await Package.find().sort({ createdAt: -1 });
  res.json(pkgs);
});

/* ---------------- PUBLIC: GET ONE ---------------- */
router.get("/public/:id", async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) return res.status(404).json({ msg: "Package not found" });
  res.json(pkg);
});

export default router;
