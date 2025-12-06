import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

/* ------------------ TEST ROUTE ------------------ */
router.get("/test", (req, res) => {
  res.send("Admin Auth Route Working 👍");
});

/*
|--------------------------------------------------------------------------
| REGISTER ADMIN (Only once)
| POST /api/admin/auth/register
|--------------------------------------------------------------------------
*/
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ msg: "All fields are required" });

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    res.json({ msg: "Admin registered successfully", admin: newAdmin });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/*
|--------------------------------------------------------------------------
| LOGIN ADMIN
| POST /api/admin/auth/login
|--------------------------------------------------------------------------
*/
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Email & password required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      admin: { name: admin.name, email: admin.email }
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/*
|--------------------------------------------------------------------------
| 🔥 RESET ADMIN PASSWORD (Temporary)
| POST /api/admin/auth/reset
|--------------------------------------------------------------------------
*/
router.post("/reset", async (req, res) => {
  try {
    const email = "admin@wrongturn.com"; // your admin email
    const newPassword = "WrongTurn@123"; // new password

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    admin.password = hashed;
    await admin.save();

    res.json({ msg: "Admin password reset successful!" });

  } catch (err) {
    res.status(500).json({ msg: "Reset failed", error: err.message });
  }
});

export default router;
