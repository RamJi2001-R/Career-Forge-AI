import puppeteer from "puppeteer";

// Common helper - HTML string se PDF buffer banata hai.
// Dono report types (ATS aur full analysis) isi ko use karte hain,
// taaki Puppeteer launch/close ka logic duplicate na ho.
const htmlToPdf = async (html) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });
  } finally {
    // Chrome hamesha band karo, chahe error aaye ya na aaye,
    // warna memory leak ho jayega server pe
    await browser.close();
  }
};

// Ye function ek AnalysisReport (jisme ATS optimization data ho) leta hai,
// use ek styled HTML me convert karta hai, aur Puppeteer se PDF bana ke
// buffer return karta hai.
export const generateAtsOptimizationPdf = async (report) => {
  return htmlToPdf(buildReportHtml(report));
};

// Phase 7: Poora analysis report ka PDF - scores, skills, gaps, suggestions sab
export const generateFullReportPdf = async (report) => {
  return htmlToPdf(buildFullReportHtml(report));
};

// PDF ka HTML template - simple inline CSS, kyunki Puppeteer ko
// external stylesheet load karwana extra complexity hai
const buildReportHtml = (report) => {
  const opt = report.atsOptimization;

  const keywordsHtml = (opt.missingKeywords || [])
    .map((k) => `<span class="chip">${escapeHtml(k)}</span>`)
    .join("");

  const bulletsHtml = (opt.bulletPointImprovements || [])
    .map(
      (b) => `
      <div class="bullet-pair">
        <p class="label">Before</p>
        <p class="original">${escapeHtml(b.original)}</p>
        <p class="label">After</p>
        <p class="improved">${escapeHtml(b.improved)}</p>
      </div>`
    )
    .join("");

  const suggestionsHtml = (opt.suggestions || [])
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join("");

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Helvetica', Arial, sans-serif; color: #1C1E22; padding: 0; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #6E6B66; font-size: 12px; margin-bottom: 24px; }
        .score-row { display: flex; gap: 24px; margin-bottom: 24px; }
        .score-box { border: 1px solid #ddd; border-radius: 8px; padding: 16px; flex: 1; }
        .score-box .value { font-size: 28px; font-weight: bold; }
        .score-box .label { font-size: 11px; color: #6E6B66; }
        h2 { font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-top: 28px; }
        .chip {
          display: inline-block; background: #f4f0e8; border-radius: 12px;
          padding: 4px 10px; margin: 3px; font-size: 11px;
        }
        .bullet-pair { margin-bottom: 14px; padding: 10px; background: #fafafa; border-radius: 6px; }
        .label { font-size: 10px; text-transform: uppercase; color: #9A9791; margin: 4px 0 2px; }
        .original { font-size: 12px; color: #a33; text-decoration: line-through; margin: 0; }
        .improved { font-size: 12px; color: #256029; margin: 0; }
        ul { font-size: 12px; padding-left: 18px; }
        li { margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <h1>CareerForge AI — ATS Optimization Report</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}</p>

      <div class="score-row">
        <div class="score-box">
          <div class="value">${report.atsScore}%</div>
          <div class="label">Current ATS Score</div>
        </div>
        <div class="score-box">
          <div class="value">${opt.improvedAtsScore}%</div>
          <div class="label">Potential ATS Score</div>
        </div>
      </div>

      <h2>Missing Keywords</h2>
      <div>${keywordsHtml || "<p>None found.</p>"}</div>

      <h2>Bullet Point Improvements</h2>
      ${bulletsHtml || "<p>No specific improvements identified.</p>"}

      <h2>Formatting Suggestions</h2>
      <ul>${suggestionsHtml}</ul>
    </body>
  </html>
  `;
};

// Basic HTML escaping - taaki AI ka output kabhi bhi HTML tags ke roop me
// inject na ho jaye PDF me (security best practice)
const escapeHtml = (str = "") =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Phase 7: poora analysis report ka HTML template
const buildFullReportHtml = (report) => {
  const chips = (arr = []) =>
    arr.map((s) => `<span class="chip">${escapeHtml(s)}</span>`).join("") ||
    "<p class='empty'>None</p>";

  const list = (arr = []) =>
    arr.map((s) => `<li>${escapeHtml(s)}</li>`).join("") ||
    "<li class='empty'>None</li>";

  // Skill gap section sirf tab dikhao jab generate ho chuka ho
  const skillGapHtml = report.skillGapDetails?.length
    ? `
      <h2>Skill Gap Analysis</h2>
      ${report.skillGapDetails
        .map(
          (s) => `
          <div class="gap-item">
            <p class="gap-title">${escapeHtml(s.skill)}
              <span class="priority priority-${(s.priority || "Low").toLowerCase()}">
                ${escapeHtml(s.priority || "")}
              </span>
            </p>
            <p class="gap-text">${escapeHtml(s.reason || "")}</p>
            <p class="gap-rec">${escapeHtml(s.recommendation || "")}</p>
          </div>`
        )
        .join("")}`
    : "";

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Helvetica', Arial, sans-serif; color: #1C1E22; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #6E6B66; font-size: 12px; margin-bottom: 24px; }
        h2 { font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-top: 26px; }
        .score-row { display: flex; gap: 20px; margin-bottom: 8px; }
        .score-box { border: 1px solid #ddd; border-radius: 8px; padding: 16px; flex: 1; text-align: center; }
        .score-box .value { font-size: 28px; font-weight: bold; }
        .score-box .label { font-size: 10px; color: #6E6B66; text-transform: uppercase; }
        .chip { display: inline-block; background: #f4f0e8; border-radius: 12px;
          padding: 4px 10px; margin: 3px; font-size: 11px; }
        ul { font-size: 12px; padding-left: 18px; }
        li { margin-bottom: 5px; }
        .empty { color: #9A9791; font-size: 12px; }
        .gap-item { margin-bottom: 12px; padding: 10px; background: #fafafa; border-radius: 6px; }
        .gap-title { font-size: 13px; font-weight: bold; margin: 0 0 4px; }
        .gap-text { font-size: 11px; color: #555; margin: 0 0 4px; }
        .gap-rec { font-size: 11px; color: #256029; margin: 0; }
        .priority { font-size: 9px; padding: 2px 6px; border-radius: 8px; margin-left: 6px; }
        .priority-high { background: #fde8e8; color: #a33; }
        .priority-medium { background: #f4f0e8; color: #8a6d2f; }
        .priority-low { background: #eee; color: #666; }
        .jd-box { font-size: 10px; color: #777; background: #fafafa;
          padding: 10px; border-radius: 6px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1>CareerForge AI — Resume Analysis Report</h1>
      <p class="subtitle">
        ${escapeHtml(report.resume?.fileName || "Resume")} &nbsp;•&nbsp;
        Generated on ${new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div class="score-row">
        <div class="score-box">
          <div class="value">${report.matchPercentage}%</div>
          <div class="label">Job Match Score</div>
        </div>
        <div class="score-box">
          <div class="value">${report.atsScore}%</div>
          <div class="label">ATS Score</div>
        </div>
      </div>

      <h2>Matched Skills</h2>
      <div>${chips(report.matchedSkills)}</div>

      <h2>Missing Skills</h2>
      <div>${chips(report.missingSkills)}</div>

      <h2>Recommended Skills</h2>
      <div>${chips(report.recommendedSkills)}</div>

      <h2>Experience Gaps</h2>
      <ul>${list(report.experienceGaps)}</ul>

      <h2>Education Match</h2>
      <p style="font-size:12px">${escapeHtml(report.educationMatch || "Not assessed")}</p>

      <h2>Improvement Suggestions</h2>
      <ul>${list(report.suggestions)}</ul>

      ${skillGapHtml}
    </body>
  </html>
  `;
};
