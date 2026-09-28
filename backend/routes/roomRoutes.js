const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

const adminOnly = [protect, requireRole("admin")];

router.get("/", getRooms);
router.post("/", adminOnly, createRoom);
router.put("/:id", adminOnly, updateRoom);
router.delete("/:id", adminOnly, deleteRoom);

module.exports = router;
