import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing. Add a valid Gemini API key to backend/.env.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
const fallbackModelName = process.env.GEMINI_FALLBACK_MODEL?.trim();
const fallbackModel = fallbackModelName
  ? genAI.getGenerativeModel({ model: fallbackModelName })
  : null;

const isTransientGeminiError = (error) => {
  const status = error.status || error.statusCode || error.response?.status;
  const message = error.message?.toLowerCase() || "";
  return [429, 500, 502, 503, 504].includes(status)
    || /overloaded|high demand|temporarily unavailable|service unavailable|rate.?limit/.test(message);
};

const generateContentWithRetry = async (prompt) => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      if (!isTransientGeminiError(error) || attempt === maxAttempts) {
        if (isTransientGeminiError(error)) {
          if (fallbackModel) {
            try {
              return await fallbackModel.generateContent(prompt);
            } catch (fallbackError) {
              if (!isTransientGeminiError(fallbackError)) throw fallbackError;
            }
          }
          throw new Error(
            "Gemini is temporarily busy. Please wait a few seconds and try again."
          );
        }
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
};

// Ye helper function Gemini ke response se JSON safely nikalta hai.
// Kabhi kabhi AI response ke aage-peeche ```json jaisi cheezein
// ya extra text add kar deta hai, isliye clean karna zaroori hai.
const parseJsonResponse = (rawText) => {
  const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
};

// Ye function asli kaam karta hai: resume text + job description
// dono Gemini ko bhejta hai, aur structured analysis wapas leta hai.
export const analyzeResumeWithAI = async (resumeText, jobDescription) => {
  const prompt = `
You are an expert career coach and ATS (Applicant Tracking System) specialist.

Analyze the RESUME against the JOB DESCRIPTION below and respond with ONLY valid JSON
(no markdown, no explanation, no extra text) in exactly this schema:

{
  "matchPercentage": number (0-100, overall fit between resume and job),
  "atsScore": number (0-100, how well-optimized the resume is for ATS systems),
  "matchedSkills": string[] (skills present in both resume and job description),
  "missingSkills": string[] (skills required by job but missing from resume),
  "recommendedSkills": string[] (additional skills that would strengthen this application),
  "experienceGaps": string[] (specific experience the job wants but resume lacks),
  "educationMatch": string (1-2 sentence assessment of education fit),
  "suggestions": string[] (5-8 concrete, actionable resume improvement suggestions)
}

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""
`;

  let result;

  try {
    result = await generateContentWithRetry(prompt);
  } catch (error) {
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error(
        "Gemini API key is invalid. Create a new key in Google AI Studio and update backend/.env."
      );
    }

    throw error;
  }

  const rawText = result.response.text();

  try {
    return parseJsonResponse(rawText);
  } catch (error) {
    // Agar AI ne valid JSON nahi diya, to clear error throw karo
    // taaki controller isse handle kar sake (retry ya user ko error dikhana)
    throw new Error("AI returned an invalid response. Please try again.");
  }
};

// Phase 4: Skill Gap Analysis - ye function un skills ko prioritize karta hai
// jo resume me missing hain, aur har ek ke liye seekhne ki recommendation deta hai.
export const analyzeSkillGapsWithAI = async (resumeText, jobDescription) => {
  const prompt = `
You are an expert career coach specializing in skill gap analysis.

Compare the RESUME against the JOB DESCRIPTION below and respond with ONLY valid JSON
(no markdown, no explanation, no extra text) in exactly this schema:

{
  "currentSkills": string[] (skills the candidate already has, based on the resume),
  "requiredSkills": string[] (skills the job description asks for),
  "skillGapDetails": [
    {
      "skill": string (a specific missing or weak skill),
      "priority": "High" | "Medium" | "Low" (how critical this skill is for the role),
      "reason": string (1 sentence on why this skill matters for this specific job),
      "recommendation": string (1-2 sentences on how to learn or demonstrate this skill,
        e.g. a course type, project idea, or certification)
    }
  ]
}

Order skillGapDetails with High priority items first, then Medium, then Low.
Include at least 4 and at most 10 items in skillGapDetails.

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""
`;

  let result;

  try {
    result = await generateContentWithRetry(prompt);
  } catch (error) {
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error(
        "Gemini API key is invalid. Create a new key in Google AI Studio and update backend/.env."
      );
    }
    throw error;
  }

  const rawText = result.response.text();

  try {
    return parseJsonResponse(rawText);
  } catch (error) {
    throw new Error("AI returned an invalid response. Please try again.");
  }
};

export const generateRoadmapWithAI = async (
  resumeText,
  jobDescription,
  skillGaps,
  durationDays
) => {
  const prompt = `
You are a practical career coach. Build a personalized ${durationDays}-day learning roadmap
to close the candidate's skill gaps for the target role.

Return ONLY valid JSON in exactly this schema:
{
  "summary": string (2-3 concise sentences),
  "days": [
    {
      "dayNumber": number (1 through ${durationDays}, each day exactly once),
      "skill": string (the main skill focus for this day),
      "priority": "High" | "Medium" | "Low",
      "objective": string (a concrete learning outcome),
      "tasks": string[] (2-4 actionable tasks for the day),
      "estimatedHours": number (between 0.5 and 8),
      "deliverable": string (something tangible to finish today),
      "milestone": boolean (true for a meaningful checkpoint)
    }
  ]
}

Rules:
- Include exactly ${durationDays} day entries, in dayNumber order, with no skipped days.
- Schedule High priority gaps before Medium and Low gaps when prerequisites allow.
- Respect real skill prerequisites; do not teach advanced work before its foundations.
- Spread longer skills across multiple days and include practice, not only passive study.
- Use the supplied skill gaps; do not invent unrelated requirements or claim specific course links.
- Make the workload realistic for the stated daily hours.

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""

SKILL GAPS (already priority-ranked):
${JSON.stringify(skillGaps)}
`;

  let result;
  try {
    result = await generateContentWithRetry(prompt);
  } catch (error) {
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error(
        "Gemini API key is invalid. Create a new key in Google AI Studio and update backend/.env."
      );
    }
    throw error;
  }

  try {
    const roadmap = parseJsonResponse(result.response.text());
    const validDays = Array.isArray(roadmap.days)
      && roadmap.days.length === durationDays
      && roadmap.days.every((day, index) =>
        day.dayNumber === index + 1
        && typeof day.skill === "string"
        && ["High", "Medium", "Low"].includes(day.priority)
        && typeof day.objective === "string"
        && Array.isArray(day.tasks)
        && typeof day.estimatedHours === "number"
        && typeof day.deliverable === "string"
        && typeof day.milestone === "boolean"
      );

    if (typeof roadmap.summary !== "string" || !validDays) {
      throw new Error("Invalid roadmap shape");
    }

    return roadmap;
  } catch (error) {
    throw new Error("AI returned an invalid roadmap. Please try again.");
  }
};

// Phase 6: ATS Optimizer - resume ke weak bullet points identify karta hai
// aur unhe stronger, keyword-rich versions me rewrite karta hai.
export const optimizeResumeWithAI = async (resumeText, jobDescription) => {
  const prompt = `
You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.

Analyze the RESUME against the JOB DESCRIPTION below and respond with ONLY valid JSON
(no markdown, no explanation, no extra text) in exactly this schema:

{
  "improvedAtsScore": number (0-100, the ATS score this resume could realistically
    reach if all suggestions below are applied),
  "missingKeywords": string[] (important keywords/phrases from the job description
    that are missing from the resume and should be added),
  "bulletPointImprovements": [
    {
      "original": string (an actual weak bullet point or sentence copied from the resume),
      "improved": string (a stronger, keyword-optimized, quantified rewrite of it)
    }
  ],
  "suggestions": string[] (4-6 concrete formatting/structure tips to improve ATS parsing,
    e.g. section headers, file format, avoiding tables/graphics)
}

Include 4-8 items in bulletPointImprovements, picking the weakest/vaguest lines from the resume.

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""
`;

  let result;

  try {
    result = await generateContentWithRetry(prompt);
  } catch (error) {
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error(
        "Gemini API key is invalid. Create a new key in Google AI Studio and update backend/.env."
      );
    }
    throw error;
  }

  const rawText = result.response.text();

  try {
    return parseJsonResponse(rawText);
  } catch (error) {
    throw new Error("AI returned an invalid response. Please try again.");
  }
};

// Phase 5: Interview Preparation - resume + JD se personalized interview
// questions generate karta hai, alag-alag categories aur difficulty ke saath.
export const generateInterviewPrepWithAI = async (resumeText, jobDescription) => {
  const prompt = `
You are an expert technical interviewer and career coach preparing a candidate
for a real interview.

Based on the RESUME and JOB DESCRIPTION below, generate a well-rounded set of
interview questions and respond with ONLY valid JSON (no markdown, no explanation,
no extra text) in exactly this schema:

{
  "questions": [
    {
      "category": "Technical" | "HR" | "Behavioral" | "Project-based",
      "question": string,
      "difficulty": "Easy" | "Medium" | "Hard",
      "suggestedAnswer": string (a concise model answer, 2-4 sentences,
        ideally referencing specifics from the candidate's resume where relevant),
      "followUpQuestions": string[] (1-2 likely follow-up questions an interviewer might ask)
    }
  ]
}

Generate exactly:
- 4 Technical questions (based on the skills/tech stack in the job description)
- 2 HR questions
- 3 Behavioral questions
- 3 Project-based questions (based on projects/experience mentioned in the resume)

RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""
`;

  let result;

  try {
    result = await generateContentWithRetry(prompt);
  } catch (error) {
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error(
        "Gemini API key is invalid. Create a new key in Google AI Studio and update backend/.env."
      );
    }
    throw error;
  }

  const rawText = result.response.text();

  try {
    return parseJsonResponse(rawText);
  } catch (error) {
    throw new Error("AI returned an invalid response. Please try again.");
  }
};
