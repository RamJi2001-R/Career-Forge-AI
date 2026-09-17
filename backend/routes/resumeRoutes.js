import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  analyzeResume,
  getMyReports,
  getReportById,
  getSkillGapAnalysis,
  getInterviewPrep,
  getAtsOptimization,
  downloadAtsOptimizationPdf,
  downloadFullReportPdf,
  getProfileStats,
} from "../controllers/resumeController.js";

const router = express.Router();

// Har route "protect" se guard hai - bina login ke koi bhi access nahi kar sakta

// upload.single("resume") - frontend form me file field ka naam "resume" hona chahiye
router.post("/analyze", protect, upload.single("resume"), analyzeResume);

router.get("/reports", protect, getMyReports);

// NOTE: ye route "/reports/:id" se PEHLE aana zaroori hai... asal me ye alag
// path hai (/profile-stats) isliye conflict nahi hoga, par specific routes ko
// hamesha dynamic (:id) routes se upar rakhna acchi practice hai.
router.get("/profile-stats", protect, getProfileStats);

router.get("/reports/:id", protect, getReportById);
router.get("/reports/:id/pdf", protect, downloadFullReportPdf);
router.get("/reports/:id/skill-gap", protect, getSkillGapAnalysis);
router.get("/reports/:id/interview-prep", protect, getInterviewPrep);
router.get("/reports/:id/ats-optimize", protect, getAtsOptimization);
router.get("/reports/:id/ats-optimize/pdf", protect, downloadAtsOptimizationPdf);

export default router;
