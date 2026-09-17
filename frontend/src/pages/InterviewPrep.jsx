import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";

const CATEGORIES = ["All", "Technical", "HR", "Behavioral", "Project-based"];

const difficultyStyles = {
  Easy: "bg-accent/10 text-accent-soft border-accent/30",
  Medium: "bg-base-surface text-ink-muted border-base-border",
  Hard: "bg-red-400/10 text-red-300 border-red-400/30",
};

// Ek question card - click karne par answer/follow-up expand hote hain
const QuestionCard = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-base-surface border border-base-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 flex items-start justify-between gap-4"
      >
        <div>
          <span className="text-xs text-ink-faint">{item.category}</span>
          <p className="text-ink font-medium mt-1">{item.question}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full border shrink-0 ${
            difficultyStyles[item.difficulty] || difficultyStyles.Medium
          }`}
        >
          {item.difficulty}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-base-border pt-4">
          <p className="text-xs text-ink-faint mb-1">Suggested answer</p>
          <p className="text-sm text-ink mb-4">{item.suggestedAnswer}</p>

          {item.followUpQuestions?.length > 0 && (
            <>
              <p className="text-xs text-ink-faint mb-1">Possible follow-ups</p>
              <ul className="list-disc list-inside space-y-1">
                {item.followUpQuestions.map((f, i) => (
                  <li key={i} className="text-sm text-ink-muted">
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const InterviewPrep = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api
      .get(`/resume/reports/${id}/interview-prep`)
      .then((res) => setQuestions(res.data.interviewPrep))
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load interview questions.")
      );
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-ink-muted text-center">{error}</p>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted">
          Generating your interview questions... this can take a few seconds.
        </p>
      </div>
    );
  }

  const filtered =
    activeCategory === "All"
      ? questions
      : questions.filter((q) => q.category === activeCategory);

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
          Interview <span className="text-highlight">preparation.</span>
        </h1>
        <p className="text-ink-muted mb-8">
          Questions tailored to your resume and this job. Tap a question to see the answer.
        </p>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                activeCategory === cat
                  ? "bg-accent text-base border-accent"
                  : "bg-base-surface text-ink-muted border-base-border hover:border-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="border border-dashed border-base-border rounded-lg p-8 text-center">
              <p className="text-ink-muted text-sm">
                No questions in this category.
              </p>
            </div>
          )}
          {filtered.map((item, i) => (
            <QuestionCard key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
