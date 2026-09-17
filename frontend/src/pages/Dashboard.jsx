import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

// Ek single report card - list me repeat hoga
const ReportCard = ({ report }) => {
  // Job description lambi hoti hai, isliye sirf pehle ~80 characters
  // ek chhoti si "job preview" ke roop me dikhate hain
  const jobPreview =
    report.jobDescription?.length > 80
      ? report.jobDescription.slice(0, 80).trim() + "..."
      : report.jobDescription;

  return (
    <Link
      to={`/report/${report._id}`}
      className="block bg-base-surface border border-base-border rounded-lg p-5
        hover:border-accent transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="text-ink font-medium">
            {report.resume?.fileName || "Resume"}
          </p>
          <p className="text-xs text-ink-faint mt-1">
            {new Date(report.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="text-accent-soft font-display text-2xl shrink-0">
          {report.matchPercentage}%
        </span>
      </div>

      {/* Job description preview - taaki pata chale ye analysis kis job ke liye tha */}
      {jobPreview && (
        <p className="text-xs text-ink-muted mb-3 line-clamp-2">{jobPreview}</p>
      )}

      <div className="w-full h-1.5 bg-base rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full"
          style={{ width: `${report.matchPercentage}%` }}
        />
      </div>
    </Link>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Dashboard load hote hi user ke saare purane reports fetch karo
  useEffect(() => {
    api
      .get("/resume/reports")
      .then((res) => setReports(res.data))
      .catch(() => {
        // Silently fail - dashboard ko toh dikhna hi chahiye,
        // reports na aaye to bas empty state dikha denge
        setReports([]);
      })
      .finally(() => setLoadingReports(false));
  }, []);

  return (
    <div className="page-glow min-h-screen px-6 py-10">
      <header className="page-content flex items-center justify-between max-w-5xl mx-auto mb-12">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-sans text-sm tracking-wide text-ink-muted">CareerForge AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Profile
          </Link>
          <button
            onClick={logout}
            className="text-sm text-ink bg-base-surface border border-base-border rounded-md px-4 py-2
              hover:bg-red-400/10 hover:text-red-300 hover:border-red-400/30 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="page-content max-w-5xl mx-auto">
        <h1 className="font-display text-4xl text-ink mb-2">
          Welcome, <span className="text-highlight">{user?.name?.split(" ")[0]}.</span>
        </h1>
        <p className="text-ink-muted mb-8">
          Upload your resume against a job description to see your match score.
        </p>

        <Link
          to="/analyze"
          className="inline-block bg-accent text-base font-medium rounded-md px-6 py-3
            hover:bg-accent-soft transition-colors mb-12"
        >
          Analyze My Resume
        </Link>

        {/* Recent Reports section */}
        <section>
          <h2 className="text-sm text-ink-muted mb-4 uppercase tracking-wide">
            Recent Analysis Reports
          </h2>

          {loadingReports && (
            <p className="text-ink-faint text-sm">Loading your reports...</p>
          )}

          {!loadingReports && reports.length === 0 && (
            <div className="border border-dashed border-base-border rounded-lg p-8 text-center">
              <p className="text-ink-muted text-sm">
                No reports yet. Analyze your first resume to see it here.
              </p>
            </div>
          )}

          {!loadingReports && reports.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {reports.map((report) => (
                <ReportCard key={report._id} report={report} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
