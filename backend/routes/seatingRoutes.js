const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/authMiddleware");
const {
  generatePlan,
  getPlans,
  getPlanById,
  deletePlan,
  exportPlanCSV,
  exportPlanPDF,
  lookupStudentInPlan,
  swapSeats,
  getMySeat,
} = require("../controllers/seatingController");

const adminOnly = [protect, requireRole("admin")];
const studentOnly = [protect, requireRole("student")];

router.post("/generate", adminOnly, generatePlan);
router.get("/my-seat", studentOnly, getMySeat);
router.get("/", getPlans);
router.get("/:id", getPlanById);
router.delete("/:id", adminOnly, deletePlan);
router.get("/:id/export", exportPlanCSV);
router.get("/:id/export-pdf", exportPlanPDF);
router.get("/:id/lookup", lookupStudentInPlan);
router.post("/:id/swap-seats", adminOnly, swapSeats);

module.exports = router;
