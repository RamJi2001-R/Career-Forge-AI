import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";

// Priority ke hisaab se alag color dikhane ke liye
const priorityStyles = {
  High: "bg-red-400/10 text-red-300 border-red-400/30",
  Medium: "bg-accent/10 text-accent-soft border-accent/30",
  Low: "bg-base-surface text-ink-muted border-base-border",
};

const SkillGapCard = ({ item }) => (
  <div className="bg-base-surface border border-base-border rounded-lg p-5">
    <div className="flex items-start justify-between gap-3 mb-2">
      <h3 className="text-ink font-medium">{item.skill}</h3>
      <span
        className={`text-xs px-2 py-1 rounded-full border shrink-0 ${
          priorityStyles[item.priority] || priorityStyles.Low
        }`}
      >
        {item.priority} priority
      </span>
    </div>
    <p className="text-sm text-ink-muted mb-3">{item.reason}</p>
    <div className="border-t border-base-border pt-3">
      <p className="text-xs text-ink-faint mb-1">How to close this gap</p>
      <p className="text-sm text-ink">{item.recommendation}</p>
    </div>
  </div>
);

const SkillGap = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/resume/reports/${id}/skill-gap`)
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load skill gap analysis.")
      );
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-ink-muted text-center">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted">
          Analyzing your skill gaps... this can take a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="page-glow min-h-screen px-6 py-10">
      <div className="page-content max-w-3xl mx-auto">
        <Link
          to={`/report/${id}`}
          className="text-sm text-ink-muted hover:text-ink transition-colors"
        >
          ← Back to report
        </Link>

        <h1 className="font-display text-4xl text-ink mt-4 mb-2">
          Skill <span className="text-highlight">gap analysis.</span>
        </h1>
        <p className="text-ink-muted mb-10">
          Here's what's holding your resume back from this role, ranked by priority.
        </p>

        {/* Current vs Required skills, agar mile ho */}
        {(data.currentSkills || data.requiredSkills) && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {data.currentSkills && (
              <div className="bg-base-surface border border-base-border rounded-lg p-5">
                <h3 className="text-sm text-ink-muted mb-3">Your Current Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.currentSkills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-soft"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.requiredSkills && (
              <div className="bg-base-surface border border-base-border rounded-lg p-5">
                <h3 className="text-sm text-ink-muted mb-3">Required by This Job</h3>
                <div className="flex flex-wrap gap-2">
                  {data.requiredSkills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-base border border-base-border text-ink-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Priority-wise skill gap cards */}
        <div className="space-y-4">
          {data.skillGapDetails?.map((item, i) => (
            <SkillGapCard key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillGap;
