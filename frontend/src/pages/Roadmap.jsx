import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";

const durations = [14, 30, 60];

const priorityStyles = {
  High: "border-red-400/30 bg-red-400/10 text-red-300",
  Medium: "border-accent/30 bg-accent/10 text-accent-soft",
  Low: "border-base-border bg-base text-ink-muted",
};

const RoadmapDay = ({ day }) => (
  <article className="relative border-l border-base-border pb-8 pl-7 last:border-transparent last:pb-0">
    <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-base" />
    <div className="rounded-lg border border-base-border bg-base-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
            Day {day.dayNumber}
          </p>
          <h2 className="mt-1 text-xl font-medium text-ink">{day.skill}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs ${priorityStyles[day.priority] || priorityStyles.Low}`}>
            {day.priority} priority
          </span>
          <span className="text-xs text-ink-muted">{day.estimatedHours}h</span>
        </div>
      </div>

      <p className="mb-4 text-sm leading-6 text-ink-muted">{day.objective}</p>
      <ul className="mb-5 space-y-2">
        {day.tasks.map((task, index) => (
          <li key={index} className="flex gap-2 text-sm leading-6 text-ink">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {task}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-start justify-between gap-3 border-t border-base-border pt-4">
        <p className="min-w-0 flex-1 text-sm text-ink-muted">
          <span className="text-ink-faint">Deliverable: </span>{day.deliverable}
        </p>
        {day.milestone && (
          <span className="shrink-0 text-xs font-medium text-accent-soft">Milestone</span>
        )}
      </div>
    </div>
  </article>
);

const Roadmap = () => {
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [durationDays, setDurationDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get(`/resume/reports/${id}/roadmap`)
      .then((response) => {
        if (!active) return;
        const savedRoadmap = response.data.roadmap;
        setRoadmap(savedRoadmap);
        if (savedRoadmap?.durationDays) setDurationDays(savedRoadmap.durationDays);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Could not load your roadmap.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const generateRoadmap = async () => {
    setGenerating(true);
    setError("");
    try {
      const response = await api.post(`/resume/reports/${id}/roadmap`, { durationDays });
      setRoadmap(response.data.roadmap);
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate your roadmap. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const roadmapMatchesDuration = roadmap?.durationDays === durationDays;

  return (
    <main className="page-glow min-h-screen px-6 py-10">
      <div className="page-content mx-auto max-w-3xl">
        <Link
          to={`/report/${id}/skill-gap`}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          ← Back to skill gaps
        </Link>

        <header className="mb-8 mt-4">
          <h1 className="font-display text-4xl text-ink">
            Learning <span className="text-highlight">roadmap.</span>
          </h1>
          <p className="mt-2 text-ink-muted">
            A day-by-day plan shaped around your gaps and this target role.
          </p>
        </header>

        <section className="mb-8 flex flex-col gap-4 border-y border-base-border py-5 sm:flex-row sm:items-end sm:justify-between">
          <label className="block text-sm text-ink-muted">
            Plan duration
            <select
              value={durationDays}
              onChange={(event) => setDurationDays(Number(event.target.value))}
              className="mt-2 block w-full rounded-lg border border-base-border bg-base-surface px-3 py-2.5 text-ink outline-none focus:border-accent sm:w-44"
              disabled={generating}
            >
              {durations.map((days) => (
                <option key={days} value={days}>{days} days</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={generateRoadmap}
            disabled={loading || generating || roadmapMatchesDuration}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-base transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating
              ? "Building your roadmap..."
              : roadmapMatchesDuration
                ? `${durationDays}-day roadmap ready`
                : `Generate ${durationDays}-day roadmap`}
          </button>
        </section>

        {error && (
          <p role="alert" className="mb-6 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-10 text-center text-ink-muted">Loading your roadmap...</p>
        ) : roadmap && roadmapMatchesDuration ? (
          <>
            <div className="mb-8 border-l-2 border-accent pl-4">
              <p className="text-sm leading-6 text-ink-muted">{roadmap.summary}</p>
              <p className="mt-2 text-xs text-ink-faint">
                {roadmap.durationDays} days · {roadmap.days.length} daily steps
              </p>
            </div>
            <div className="ml-1">
              {roadmap.days.map((day) => <RoadmapDay key={day.dayNumber} day={day} />)}
            </div>
          </>
        ) : roadmap ? (
          <p className="py-8 text-sm text-ink-muted">
            Your saved {roadmap.durationDays}-day plan will remain available until you generate a plan with the selected duration.
          </p>
        ) : !error ? (
          <p className="py-8 text-sm text-ink-muted">
            Generate a personalized plan to turn your highest-priority skill gaps into focused daily practice.
          </p>
        ) : null}
      </div>
    </main>
  );
};

export default Roadmap;