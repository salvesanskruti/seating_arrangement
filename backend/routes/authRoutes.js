const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  register,
  studentSignup,
  login,
  getMe,
  bootstrapStatus,
} = require("../controllers/authController");

router.get("/bootstrap-status", bootstrapStatus);
router.post("/login", login);
router.post("/student-signup", studentSignup);
router.get("/me", protect, getMe);

// Admin registration: open with no auth ONLY if no admin exists yet (first
// admin bootstrap). Afterward, creating additional admins requires an
// existing logged-in admin.
router.post("/register", async (req, res, next) => {
  const adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount === 0) return register(req, res);
  return protect(req, res, () => requireRole("admin")(req, res, () => register(req, res)));
});

module.exports = router;
