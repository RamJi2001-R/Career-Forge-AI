import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-glow min-h-screen flex items-center justify-center px-6 py-12">
      <div className="page-content w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-10">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-sans text-sm tracking-wide text-ink-muted">CareerForge AI</span>
        </Link>

        <h1 className="font-display text-4xl text-ink mb-2">
          Welcome <span className="text-highlight">back.</span>
        </h1>
        <p className="text-ink-muted mb-10">Sign in to continue your progress.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Your password"
              className="input-field"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-4 py-3">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary mt-2">
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-ink-muted text-sm mt-8">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent hover:text-accent-soft transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
