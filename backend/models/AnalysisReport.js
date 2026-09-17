import mongoose from "mongoose";

// Ye schema Gemini se aane wale structured JSON ko match karta hai.
// aiService.js jo JSON return karega, wo isi shape ka hoga.
const analysisReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    matchPercentage: {
      type: Number, // 0-100, overall resume-JD match
      required: true,
    },
    atsScore: {
      type: Number, // 0-100, ATS-friendliness score
      required: true,
    },
    matchedSkills: [String],
    missingSkills: [String],
    recommendedSkills: [String],
    experienceGaps: [String],
    educationMatch: {
      type: String, // short text summary
    },
    suggestions: [String], // improvement tips

    // Phase 4: detailed skill gap breakdown, priority ke saath.
    // Ye lazily generate hota hai (jab user Skill Gap page kholta hai),
    // isliye default empty array hai.
    skillGapDetails: [
      {
        skill: String,
        priority: {
          type: String,
          enum: ["High", "Medium", "Low"],
        },
        reason: String, // ye skill kyun zaroori hai is job ke liye
        recommendation: String, // isko kaise seekhein
      },
    ],

    // Phase 5: interview preparation questions, lazily generate hote hain
    // (jaise skillGapDetails), taaki dobara AI call na lagana pade.
    interviewPrep: [
      {
        category: {
          type: String,
          enum: ["Technical", "HR", "Behavioral", "Project-based"],
        },
        question: String,
        difficulty: {
          type: String,
          enum: ["Easy", "Medium", "Hard"],
        },
        suggestedAnswer: String,
        followUpQuestions: [String],
      },
    ],

    // Phase 6: ATS optimization data, lazily generate hota hai
    atsOptimization: {
      improvedAtsScore: Number,
      missingKeywords: [String],
      bulletPointImprovements: [
        {
          original: String,
          improved: String,
        },
      ],
      suggestions: [String],
    },
  },
  { timestamps: true }
);

const AnalysisReport = mongoose.model("AnalysisReport", analysisReportSchema);

export default AnalysisReport;
