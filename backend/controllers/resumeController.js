import Resume from "../models/Resume.js";
import AnalysisReport from "../models/AnalysisReport.js";
import { extractTextFromResume } from "../services/resumeParserService.js";
import {
  analyzeResumeWithAI,
  analyzeSkillGapsWithAI,
  generateInterviewPrepWithAI,
  optimizeResumeWithAI,
} from "../services/aiService.js";
import {
  generateAtsOptimizationPdf,
  generateFullReportPdf,
} from "../services/pdfService.js";

// @route   POST /api/resume/analyze
// @access  Private
// Frontend yahan resume file (multipart/form-data) + jobDescription (text) bhejega
export const analyzeResume = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const file = req.file; // multer ne ye attach kiya hoga

    if (!file) {
      return res.status(400).json({ message: "Please upload a resume file" });
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      return res
        .status(400)
        .json({ message: "Please provide a detailed job description" });
    }

    // Step 1: File se text nikalo
    const extractedText = await extractTextFromResume(file.buffer, file.mimetype);

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        message: "Could not extract enough text from this resume. Try a different file.",
      });
    }

    // Step 2: Resume record DB me save karo (history ke liye)
    const resume = await Resume.create({
      user: req.user._id,
      fileName: file.originalname,
      extractedText,
    });

    // Step 3: Gemini se analysis karwao
    const analysis = await analyzeResumeWithAI(extractedText, jobDescription);

    // Step 4: Analysis report DB me save karo
    const report = await AnalysisReport.create({
      user: req.user._id,
      resume: resume._id,
      jobDescription,
      ...analysis, // matchPercentage, atsScore, matchedSkills, etc. spread ho jayenge
    });

    res.status(201).json(report);
  } catch (error) {
    console.error("Resume analysis error:", error.message);
    res.status(500).json({
      message: error.message || "Something went wrong while analyzing the resume",
    });
  }
};

// @route   GET /api/resume/reports
// @access  Private
// Dashboard ke liye - logged-in user ke saare purane reports laata hai
export const getMyReports = async (req, res) => {
  try {
    const reports = await AnalysisReport.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // sabse naya sabse upar
      .populate("resume", "fileName");

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/resume/reports/:id/skill-gap
// @access  Private
// Skill gap details lazily generate karta hai - agar pehle se save hain
// (yaani cache hit), to seedha wahi return kar deta hai, dobara AI call nahi karta.
export const getSkillGapAnalysis = async (req, res) => {
  try {
    const report = await AnalysisReport.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("resume", "extractedText fileName");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Cache check: agar pehle se generate ho chuka hai, to wahi bhej do
    if (report.skillGapDetails && report.skillGapDetails.length > 0) {
      return res.status(200).json(report);
    }

    // Pehli baar hai - Gemini se skill gap analysis karwao
    const skillGapData = await analyzeSkillGapsWithAI(
      report.resume.extractedText,
      report.jobDescription
    );

    report.skillGapDetails = skillGapData.skillGapDetails;
    // currentSkills/requiredSkills sirf response me bhej denge, DB me
    // dobara store nahi kar rahe kyunki matchedSkills/missingSkills
    // pehle se hi report me maujood hain
    await report.save();

    res.status(200).json({
      ...report.toObject(),
      currentSkills: skillGapData.currentSkills,
      requiredSkills: skillGapData.requiredSkills,
    });
  } catch (error) {
    console.error("Skill gap analysis error:", error.message);
    res.status(500).json({
      message: error.message || "Something went wrong while analyzing skill gaps",
    });
  }
};

// @route   GET /api/resume/reports/:id/interview-prep
// @access  Private
// Interview questions bhi lazily generate hote hain, skill gap jaisa hi
// caching pattern - agar pehle se saved hain to dobara AI call nahi karta.
export const getInterviewPrep = async (req, res) => {
  try {
    const report = await AnalysisReport.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("resume", "extractedText fileName");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.interviewPrep && report.interviewPrep.length > 0) {
      return res.status(200).json(report);
    }

    const interviewData = await generateInterviewPrepWithAI(
      report.resume.extractedText,
      report.jobDescription
    );

    report.interviewPrep = interviewData.questions;
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    console.error("Interview prep error:", error.message);
    res.status(500).json({
      message: error.message || "Something went wrong while generating interview questions",
    });
  }
};

// @route   GET /api/resume/reports/:id/ats-optimize
// @access  Private
// Same caching pattern - pehli baar AI call karta hai, phir cached data return karta hai
export const getAtsOptimization = async (req, res) => {
  try {
    const report = await AnalysisReport.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("resume", "extractedText fileName");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.atsOptimization && report.atsOptimization.improvedAtsScore) {
      return res.status(200).json(report);
    }

    const optimizationData = await optimizeResumeWithAI(
      report.resume.extractedText,
      report.jobDescription
    );

    report.atsOptimization = optimizationData;
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    console.error("ATS optimization error:", error.message);
    res.status(500).json({
      message: error.message || "Something went wrong while optimizing the resume",
    });
  }
};

// @route   GET /api/resume/reports/:id/ats-optimize/pdf
// @access  Private
// Optimization report ko PDF ke roop me download karwata hai.
// Agar optimization data pehle se nahi hai, to pehle usse generate karta hai.
export const downloadAtsOptimizationPdf = async (req, res) => {
  try {
    const report = await AnalysisReport.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("resume", "extractedText fileName");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Agar optimization data missing hai, to pehle wahi generate kar lo
    if (!report.atsOptimization || !report.atsOptimization.improvedAtsScore) {
      const optimizationData = await optimizeResumeWithAI(
        report.resume.extractedText,
        report.jobDescription
      );
      report.atsOptimization = optimizationData;
      await report.save();
    }

    const pdfBuffer = await generateAtsOptimizationPdf(report);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=ats-optimization-report.pdf",
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error.message);
    res.status(500).json({
      message: error.message || "Something went wrong while generating the PDF",
    });
  }
};

// @route   GET /api/resume/reports/:id/pdf
// @access  Private
// Phase 7: poora analysis report PDF ke roop me download karwata hai
export const downloadFullReportPdf = async (req, res) => {
  try {
    const report = await AnalysisReport.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("resume", "fileName");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const pdfBuffer = await generateFullReportPdf(report);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=careerforge-analysis-report.pdf",
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Full report PDF error:", error.message);
    res.status(500).json({
      message: error.message || "Something went wrong while generating the PDF",
    });
  }
};

// @route   GET /api/resume/profile-stats
// @access  Private
// Phase 8: Profile page ke liye - resume history aur career progress stats
export const getProfileStats = async (req, res) => {
  try {
    const reports = await AnalysisReport.find({ user: req.user._id })
      .sort({ createdAt: 1 }) // purana pehle, taaki progress trend nikal sakein
      .populate("resume", "fileName");

    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("fileName createdAt");

    // Basic stats calculate karo
    const totalAnalyses = reports.length;

    const avgMatch =
      totalAnalyses > 0
        ? Math.round(
            reports.reduce((sum, r) => sum + r.matchPercentage, 0) / totalAnalyses
          )
        : 0;

    const avgAts =
      totalAnalyses > 0
        ? Math.round(reports.reduce((sum, r) => sum + r.atsScore, 0) / totalAnalyses)
        : 0;

    const bestMatch =
      totalAnalyses > 0 ? Math.max(...reports.map((r) => r.matchPercentage)) : 0;

    // Progress trend - har analysis ka match score, chronological order me
    const progressTrend = reports.map((r) => ({
      date: r.createdAt,
      matchPercentage: r.matchPercentage,
      atsScore: r.atsScore,
      fileName: r.resume?.fileName || "Resume",
    }));

    res.status(200).json({
      totalAnalyses,
      totalResumes: resumes.length,
      avgMatch,
      avgAts,
      bestMatch,
      progressTrend,
      resumes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route   GET /api/resume/reports/:id
// @access  Private
// Ek specific report ki detail dekhne ke liye (Report page ke liye)
export const getReportById = async (req, res) => {
  try {
    const report = await AnalysisReport.findOne({
      _id: req.params.id,
      user: req.user._id, // security: sirf apna hi report dekh sake
    }).populate("resume", "fileName");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
