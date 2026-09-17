import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import { downloadPdf } from "../utils/downloadPdf.js";

// Score card keeps the two headline metrics easy to scan at a glance.
const ScoreCard = ({ label, value, description }) => (
  <div className="relative overflow-hidden rounded-2xl border border-base-border bg-base-surface p-5">
    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-accent/10" />
    <div className="relative">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">{label}</p>
      <div className="mt-3 flex items-end gap-1">
        <span className="font-display text-5xl leading-none text-accent-soft">{value}</span>
        <span className="mb-1 text-lg text-ink-muted">%</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-base">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${Math.min(Math.max(value || 0, 0), 100)}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-ink-muted">{description}</p>
    </div>
  </div>
);

// Skill chips - matched/missing/recommended skills dikhane ke liye
const SkillList = ({ title, skills, tone }) => {
  const toneClasses = {
    good: "bg-accent/10 text-accent-soft border-accent/30",
    bad: "bg-red-400/10 text-red-300 border-red-400/30",
    neutral: "bg-base-surface text-ink-muted border-base-border",
  };

  if (!skills || skills.length === 0) return null;

  return (
    <div className="mb-7 last:mb-0">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-ink-faint">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span
            key={i}
            className={`rounded-lg border px-3 py-2 text-sm ${toneClasses[tone]}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

const Report = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadPdf(
        `/resume/reports/${id}/pdf`,
        "careerforge-analysis-report.pdf"
      );
    } catch (err) {
      setError("Could not download the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    api
      .get(`/resume/reports/${id}`)
      .then((res) => setReport(res.data))
      .catch(() => setError("Could not load this report."));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted">{error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted">Loading report...</p>
      </div>
    );
  }

  return (
    <div className="page-glow min-h-screen px-6 py-10">
        <div className="page-content mx-auto max-w-5xl">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link to="/dashboard" className="text-sm text-ink-muted transition-colors hover:text-ink">
              ← Back to dashboard
            </Link>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-lg border border-base-border bg-base-surface px-4 py-2 text-sm text-ink transition-colors hover:border-accent disabled:opacity-50"
            >
              {downloading ? "Preparing..." : "Download PDF"}
            </button>
          </div>

          <header className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">CareerForge analysis</p>
            <h1 className="font-display text-4xl leading-tight text-ink sm:text-6xl">
              Your resume, <span className="text-highlight">decoded.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">
              A clear read on where your resume stands and the next moves that can make it stronger.
            </p>
          </header>

          <section className="mb-10 grid gap-4 sm:grid-cols-2" aria-label="Report scores">
            <ScoreCard
              label="Resume match"
              value={report.matchPercentage}
              description="How closely your experience fits this role"
            />
            <ScoreCard
              label="ATS readiness"
              value={report.atsScore}
              description="How well your resume is structured for screening systems"
            />
          </section>

          <div className="mb-10 flex flex-wrap gap-3 border-b border-base-border pb-10">
            <Link to={`/report/${report._id}/skill-gap`} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-base transition-colors hover:bg-accent-soft">
              Explore skill gaps
            </Link>
            <Link to={`/report/${report._id}/interview-prep`} className="rounded-lg border border-base-border px-4 py-2.5 text-sm text-ink transition-colors hover:border-accent">
              Prepare for interview
            </Link>
            <Link to={`/report/${report._id}/ats-optimize`} className="rounded-lg border border-base-border px-4 py-2.5 text-sm text-ink transition-colors hover:border-accent">
              Optimize for ATS
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-base-border bg-base-surface p-6 sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Your toolkit</p>
                <h2 className="mt-2 font-display text-3xl text-ink">Skills in the spotlight</h2>
              </div>
              <SkillList title="Matched skills" skills={report.matchedSkills} tone="good" />
              <SkillList title="Missing skills" skills={report.missingSkills} tone="bad" />
              <SkillList title="Recommended skills" skills={report.recommendedSkills} tone="neutral" />
            </section>

            <div className="space-y-6">
              {report.experienceGaps?.length > 0 && (
                <section className="rounded-2xl border border-base-border bg-base-surface p-6">
                  <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-accent">Experience gaps</p>
                  <ul className="space-y-3 text-sm leading-6 text-ink-muted">
                    {report.experienceGaps.map((gap, i) => <li key={i} className="border-l-2 border-accent/40 pl-3">{gap}</li>)}
                  </ul>
                </section>
              )}

              {report.educationMatch && (
                <section className="rounded-2xl border border-base-border bg-base-surface p-6">
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-accent">Education match</p>
                  <p className="text-sm leading-6 text-ink-muted">{report.educationMatch}</p>
                </section>
              )}
            </div>
          </div>

          {report.suggestions?.length > 0 && (
            <section className="mt-6 rounded-2xl border border-accent/30 bg-accent/[0.06] p-6 sm:p-8">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-accent">Recommended next steps</p>
              <h2 className="mb-5 font-display text-3xl text-ink">Make your application sharper.</h2>
              <ul className="grid gap-3 text-sm leading-6 text-ink-muted sm:grid-cols-2">
                {report.suggestions.map((tip, i) => <li key={i} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{tip}</li>)}
              </ul>
            </section>
          )}
        </div>
    </div>
  );
};

export default Report;
