import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-glow min-h-screen flex items-center justify-center px-6 py-12">
      <div className="page-content w-full max-w-md">
        {/* Brand mark */}
        <Link to="/" className="inline-flex items-center gap-2 mb-10">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-sans text-sm tracking-wide text-ink-muted">CareerForge AI</span>
        </Link>

        <h1 className="font-display text-4xl text-ink mb-2">
          Create your <span className="text-highlight">career edge.</span>
        </h1>
        <p className="text-ink-muted mb-10">
          Start turning your resume into your career advantage.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-ink-muted mb-2">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Ananya Sharma"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-ink-muted mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-ink-muted mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="input-field"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-4 py-3">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary mt-2">
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-ink-muted text-sm mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:text-accent-soft transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
