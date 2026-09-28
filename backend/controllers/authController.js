const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const { JWT_SECRET } = require("../middleware/authMiddleware");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

const sanitize = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  rollNo: user.rollNo || undefined,
});

// GET /api/auth/bootstrap-status -> tells frontend whether any admin exists yet
exports.bootstrapStatus = async (req, res) => {
  const count = await User.countDocuments({ role: "admin" });
  res.json({ needsSetup: count === 0 });
};

// POST /api/auth/register  (ADMIN registration)
// Open with no token ONLY when no admin exists yet (bootstrap the first
// admin). Once at least one admin exists, this route requires an existing
// logged-in admin (see routes/authRoutes.js).
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role: "admin" });
    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/student-signup  (STUDENT self-registration)
// Requires the roll number to already exist in the Student roster (added by
// an admin) so only real, registered students can create a login. One login
// account per roll number.
exports.studentSignup = async (req, res) => {
  try {
    const { name, email, password, rollNo } = req.body;
    if (!name || !email || !password || !rollNo) {
      return res.status(400).json({ message: "name, email, password and rollNo are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const student = await Student.findOne({ rollNo: rollNo.trim() });
    if (!student) {
      return res.status(404).json({
        message: "Roll number not found in the student roster. Ask your exam admin to add you first.",
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(409).json({ message: "Email already registered" });

    const existingRoll = await User.findOne({ rollNo: rollNo.trim(), role: "student" });
    if (existingRoll) return res.status(409).json({ message: "An account already exists for this roll number" });

    const user = await User.create({
      name,
      email,
      password,
      role: "student",
      rollNo: rollNo.trim(),
      student: student._id,
    });
    const token = signToken(user);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login  (shared by admin and student)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user);
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: sanitize(req.user) });
};
