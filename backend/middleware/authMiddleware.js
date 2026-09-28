const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Not authorized, user not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Use AFTER protect: requireRole("admin"), requireRole("student"), or
// requireRole("admin", "student") to allow either.
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: `This action requires role: ${roles.join(" or ")}` });
  }
  next();
};

exports.JWT_SECRET = JWT_SECRET;
