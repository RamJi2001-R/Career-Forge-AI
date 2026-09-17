import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import { downloadPdf } from "../utils/downloadPdf.js";

const AtsOptimizer = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api
      .get(`/resume/reports/${id}/ats-optimize`)
      .then((res) => setReport(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load ATS optimization.")
      );
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadPdf(
        `/resume/reports/${id}/ats-optimize/pdf`,
        "ats-optimization-report.pdf"
      );
    } catch (err) {
      setError("Could not download the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-ink-muted text-center">{error}</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted">
          Optimizing your resume... this can take a few seconds.
        </p>
      </div>
    );
  }

  const opt = report.atsOptimization;

  return (
    <div className="page-glow min-h-screen px-6 py-10">
      <div className="page-content max-w-3xl mx-auto">
        <Link
          to={`/report/${id}`}
          className="text-sm text-ink-muted hover:text-ink transition-colors"
        >
          ← Back to report
        </Link>

        <div className="flex items-center justify-between mt-4 mb-10 gap-4">
          <h1 className="font-display text-4xl text-ink">
            ATS <span className="text-highlight">optimizer.</span>
          </h1>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="text-sm bg-accent text-base font-medium rounded-md px-5 py-2.5
              hover:bg-accent-soft transition-colors disabled:opacity-50 shrink-0"
          >
            {downloading ? "Preparing..." : "Download PDF"}
          </button>
        </div>

        {/* Score comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-base-surface border border-base-border rounded-lg p-6 text-center">
            <p className="font-display text-4xl text-ink">{report.atsScore}%</p>
            <p className="text-xs text-ink-faint mt-1 uppercase tracking-wide">
              Current ATS Score
            </p>
          </div>
          <div className="bg-base-surface border border-accent/40 rounded-lg p-6 text-center">
            <p className="font-display text-4xl text-accent-soft">
              {opt.improvedAtsScore}%
            </p>
            <p className="text-xs text-ink-faint mt-1 uppercase tracking-wide">
              Potential ATS Score
            </p>
          </div>
        </div>

        {/* Missing keywords */}
        {opt.missingKeywords?.length > 0 && (
          <div className="bg-base-surface border border-base-border rounded-lg p-6 mb-8">
            <h3 className="text-sm text-ink-muted mb-3">Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {opt.missingKeywords.map((k, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full bg-base border border-base-border text-ink-muted"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bullet point improvements */}
        {opt.bulletPointImprovements?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm text-ink-muted mb-3">Bullet Point Improvements</h3>
            <div className="space-y-3">
              {opt.bulletPointImprovements.map((b, i) => (
                <div
                  key={i}
                  className="bg-base-surface border border-base-border rounded-lg p-5"
                >
                  <p className="text-xs text-ink-faint mb-1">Before</p>
                  <p className="text-sm text-ink-muted line-through mb-3">{b.original}</p>
                  <p className="text-xs text-ink-faint mb-1">After</p>
                  <p className="text-sm text-accent-soft">{b.improved}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formatting suggestions */}
        {opt.suggestions?.length > 0 && (
          <div className="bg-base-surface border border-base-border rounded-lg p-6">
            <h3 className="text-sm text-ink-muted mb-3">Formatting Suggestions</h3>
            <ul className="list-disc list-inside space-y-2 text-ink text-sm">
              {opt.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AtsOptimizer;
