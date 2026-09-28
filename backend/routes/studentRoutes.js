const express = require("express");
const multer = require("multer");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  deleteAllStudents,
  uploadCSV,
} = require("../controllers/studentController");

const upload = multer({ storage: multer.memoryStorage() });
const adminOnly = [protect, requireRole("admin")];

router.get("/", getStudents);
router.post("/", adminOnly, createStudent);
router.put("/:id", adminOnly, updateStudent);
router.delete("/all", adminOnly, deleteAllStudents);
router.delete("/:id", adminOnly, deleteStudent);
router.post("/upload-csv", adminOnly, upload.single("file"), uploadCSV);

module.exports = router;
