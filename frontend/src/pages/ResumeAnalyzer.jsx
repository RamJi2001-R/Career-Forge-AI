import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

const ResumeAnalyzer = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload your resume (PDF or DOCX).");
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError("Please paste a more detailed job description.");
      return;
    }

    // FormData zaroori hai kyunki hum file + text dono ek saath bhej rahe hain
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    setLoading(true);
    try {
      const res = await api.post("/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Analysis ban gaya - seedha uski report page pe bhej do
      navigate(`/report/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-glow min-h-screen px-6 py-10">
      <div className="page-content max-w-3xl mx-auto">
        <Link
          to="/dashboard"
          className="text-sm text-ink-muted hover:text-ink transition-colors"
        >
          ← Back to dashboard
        </Link>

        <h1 className="font-display text-4xl text-ink mt-4 mb-2">
          Analyze your <span className="text-highlight">resume.</span>
        </h1>
        <p className="text-ink-muted mb-10">
          Upload your resume and paste the job description to get your match score.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume upload */}
          <div>
            <label className="block text-sm text-ink-muted mb-2">
              Resume (PDF or DOCX)
            </label>
            <label
              htmlFor="resume-upload"
              className="flex items-center justify-center border border-dashed border-base-border
                rounded-md px-4 py-10 cursor-pointer hover:border-accent transition-colors
                bg-base-surface"
            >
              <span className="text-ink-muted text-sm">
                {file ? file.name : "Click to select a file (max 5MB)"}
              </span>
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Job description */}
          <div>
            <label htmlFor="jd" className="block text-sm text-ink-muted mb-2">
              Job description
            </label>
            <textarea
              id="jd"
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="input-field resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-4 py-3">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Analyzing... this can take a few seconds" : "Analyze Resume"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
