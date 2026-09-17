import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

// Ek chhota stat box - 4 baar repeat hoga
const StatBox = ({ value, label }) => (
  <div className="bg-base-surface border border-base-border rounded-lg p-5 text-center">
    <p className="font-display text-3xl text-ink">{value}</p>
    <p className="text-xs text-ink-faint mt-1 uppercase tracking-wide">{label}</p>
  </div>
);

// Career progress - trend line makes improvement easier to read than flat bars.
const ProgressChart = ({ trend }) => {
  if (!trend || trend.length === 0) return null;

  const chartWidth = 720;
  const chartHeight = 220;
  const chartTop = 16;
  const chartBottom = 190;
  const chartLeft = 14;
  const chartRight = 706;
  const xStep = trend.length === 1 ? 0 : (chartRight - chartLeft) / (trend.length - 1);
  const getX = (index) => chartLeft + index * xStep;
  const getY = (score) => chartBottom - (Math.min(Math.max(score || 0, 0), 100) / 100) * (chartBottom - chartTop);
  const points = trend.map((point, index) => `${getX(index)},${getY(point.matchPercentage)}`).join(" ");
  const areaPoints = `${chartLeft},${chartBottom} ${points} ${getX(trend.length - 1)},${chartBottom}`;
  const latestScore = trend[trend.length - 1].matchPercentage;
  const firstScore = trend[0].matchPercentage;
  const change = latestScore - firstScore;

  return (
    <div className="rounded-2xl border border-base-border bg-base-surface p-5 sm:p-7">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Your trajectory</p>
          <h3 className="mt-2 font-display text-3xl text-ink">Career progress</h3>
          <p className="mt-1 text-sm text-ink-muted">Match score over your latest analyses</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl text-accent-soft">{latestScore}%</p>
          <p className={`text-xs ${change >= 0 ? "text-accent" : "text-red-300"}`}>
            {change > 0 ? `+${change}` : change} pts overall
          </p>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[560px]">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-auto w-full" role="img" aria-label="Resume match score trend">
            {[0, 25, 50, 75, 100].map((score) => {
              const y = getY(score);
              return (
                <g key={score}>
                  <line x1={chartLeft} x2={chartRight} y1={y} y2={y} stroke="currentColor" className="text-base-border" strokeWidth="1" strokeDasharray="4 6" />
                  <text x="0" y={y + 4} className="fill-ink-faint text-[11px]">{score}</text>
                </g>
              );
            })}
            <polygon points={areaPoints} className="fill-accent/10" />
            {trend.length > 1 && (
              <polyline points={points} fill="none" stroke="currentColor" className="text-accent" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {trend.map((point, index) => (
              <g key={index}>
                <circle cx={getX(index)} cy={getY(point.matchPercentage)} r="8" className="fill-base-surface stroke-accent" strokeWidth="4">
                  <title>{`${point.fileName || "Analysis"}: ${point.matchPercentage}%`}</title>
                </circle>
                <text x={getX(index)} y={getY(point.matchPercentage) - 16} textAnchor="middle" className="fill-ink text-[12px] font-medium">{point.matchPercentage}%</text>
              </g>
            ))}
          </svg>
          <div className="mt-1 flex justify-between gap-3 pl-5 text-[11px] text-ink-faint">
            <span>Oldest</span>
            <span>Newest</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/resume/profile-stats")
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-glow min-h-screen px-6 py-10">
      <header className="page-content flex items-center justify-between max-w-4xl mx-auto mb-12">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-sans text-sm tracking-wide text-ink-muted">
            CareerForge AI
          </span>
        </Link>
        <button
          onClick={logout}
          className="text-sm text-ink bg-base-surface border border-base-border rounded-md px-4 py-2
            hover:bg-red-400/10 hover:text-red-300 hover:border-red-400/30 transition-colors"
        >
          Log out
        </button>
      </header>

      <main className="page-content max-w-4xl mx-auto">
        {/* User info */}
        <span className="font-display text-4xl mb-1 text-highlight">{user?.name}.</span>
        <p className="text-ink-muted mb-10">{user?.email}</p>

        {loading && <p className="text-ink-faint text-sm">Loading your profile...</p>}

        {!loading && stats && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <StatBox value={stats.totalAnalyses} label="Analyses" />
              <StatBox value={stats.totalResumes} label="Resumes" />
              <StatBox value={`${stats.avgMatch}%`} label="Avg Match" />
              <StatBox value={`${stats.bestMatch}%`} label="Best Match" />
            </div>

            {/* Progress chart */}
            {stats.progressTrend?.length > 0 && (
              <div className="mb-10">
                <ProgressChart trend={stats.progressTrend} />
              </div>
            )}

            {/* Resume history */}
            <section>
              <h2 className="text-sm text-ink-muted mb-4 uppercase tracking-wide">
                Resume History
              </h2>

              {stats.resumes?.length === 0 ? (
                <div className="border border-dashed border-base-border rounded-lg p-8 text-center">
                  <p className="text-ink-muted text-sm mb-4">
                    You haven't uploaded any resumes yet.
                  </p>
                  <Link
                    to="/analyze"
                    className="text-sm text-accent hover:text-accent-soft transition-colors"
                  >
                    Analyze your first resume →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.resumes.map((r) => (
                    <div
                      key={r._id}
                      className="bg-base-surface border border-base-border rounded-lg px-5 py-4
                        flex items-center justify-between"
                    >
                      <p className="text-ink text-sm">{r.fileName}</p>
                      <p className="text-xs text-ink-faint">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
