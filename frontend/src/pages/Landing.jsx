import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Feature card - 4 baar repeat hoga
const FeatureCard = ({ title, description }) => (
  <div className="bg-base-surface border border-base-border rounded-lg p-6 hover:border-accent/50 transition-colors">
    <h3 className="font-display text-xl text-ink mb-2">{title}</h3>
    <p className="text-sm text-ink-muted">{description}</p>
  </div>
);

// "How it works" ka ek step
const StepItem = ({ number, title, description }) => (
  <div className="flex gap-4">
    <span className="font-display text-2xl text-accent-soft shrink-0">{number}</span>
    <div>
      <h3 className="text-ink font-medium mb-1">{title}</h3>
      <p className="text-sm text-ink-muted">{description}</p>
    </div>
  </div>
);

// Testimonial card - fictional users, koi real person nahi
const TestimonialCard = ({ quote, name, role }) => (
  <div className="bg-base-surface border border-base-border rounded-lg p-6 hover:border-accent/50 transition-colors">
    <p className="text-ink text-sm mb-4">"{quote}"</p>
    <p className="text-sm text-ink font-medium">{name}</p>
    <p className="text-xs text-ink-faint">{role}</p>
  </div>
);

// FAQ accordion item - apni khud ki open/close state rakhta hai
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-base-border py-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-ink font-medium">{question}</span>
        <span className="text-ink-muted text-xl shrink-0 ml-4">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="text-sm text-ink-muted mt-3">{answer}</p>}
    </div>
  );
};

const Landing = () => {
  const { user } = useAuth();

  // Agar user pehle se login hai, to CTA seedha dashboard/analyzer pe le jaye,
  // warna register page pe le jaye
  const primaryCtaLink = user ? "/analyze" : "/register";
  const secondaryCtaLink = user ? "/dashboard" : "/register";

  return (
    <div className="page-glow min-h-screen">
      <div className="page-content">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-sans text-sm tracking-wide text-ink-muted">
            CareerForge AI
          </span>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <Link
              to="/dashboard"
              className="text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-ink-muted hover:text-ink transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm bg-accent text-base font-medium rounded-md px-4 py-2
                  hover:bg-accent-soft transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-5xl sm:text-6xl text-ink leading-tight mb-6">
            Turn your resume into your{" "}
            <span className="text-highlight">career advantage.</span>
          </h1>
          <p className="text-ink-muted text-lg max-w-xl mx-auto mb-10">
            CareerForge AI analyzes your resume against any job description,
            finds your skill gaps, and preps you for the interview — powered by AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              to={primaryCtaLink}
              className="bg-accent text-base font-medium rounded-md px-6 py-3 text-center
                hover:bg-accent-soft transition-colors"
            >
              Analyze My Resume
            </Link>
            <Link
              to={secondaryCtaLink}
              className="text-ink border border-base-border rounded-md px-6 py-3 text-center
                hover:border-accent transition-colors"
            >
              {user ? "Go to Dashboard" : "Get Started"}
            </Link>
          </div>

          {/* Simple animated "AI visual" - CSS se banaya, koi image nahi */}
          <div className="relative w-full max-w-md mx-auto h-56 flex items-center justify-center">
            <div className="absolute w-40 h-40 rounded-full border border-accent/30 animate-ping-slow" />
            <div className="absolute w-28 h-28 rounded-full border border-accent/50" />
            <div className="absolute w-14 h-14 rounded-full bg-accent/80" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-ink text-center mb-12">
          Everything you need to <span className="text-highlight">land the job.</span>
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <FeatureCard
            title="Resume Analysis"
            description="See exactly how well your resume matches a job description, with a clear match score."
          />
          <FeatureCard
            title="AI Skill Gap Detection"
            description="Know which skills are missing, ranked by priority, with recommendations on how to close each gap."
          />
          <FeatureCard
            title="Interview Preparation"
            description="Get technical, HR, behavioral, and project-based questions tailored to your resume and the role."
          />
          <FeatureCard
            title="ATS Resume Optimization"
            description="Improve your ATS score with keyword suggestions and rewritten, stronger bullet points."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-base-surface/40">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl text-ink text-center mb-12">
            How it <span className="text-highlight">works.</span>
          </h2>
          <div className="space-y-8">
            <StepItem
              number="01"
              title="Upload your resume"
              description="PDF or DOCX, straight from your computer."
            />
            <StepItem
              number="02"
              title="Paste the job description"
              description="Any role, any company — the more detail, the better the analysis."
            />
            <StepItem
              number="03"
              title="Get your AI analysis"
              description="Match score, ATS score, skill gaps, and concrete suggestions in seconds."
            />
            <StepItem
              number="04"
              title="Prepare and apply"
              description="Practice interview questions and optimize your resume before you hit submit."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-ink text-center mb-12">
          Loved by <span className="text-highlight">job seekers.</span>
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          <TestimonialCard
            quote="I found three skill gaps I didn't even know I had. Fixed them before my interview and got the offer."
            name="Ananya R."
            role="Software Engineer"
          />
          <TestimonialCard
            quote="The ATS optimizer rewrote my weakest bullet points. My callback rate noticeably improved."
            name="Karan M."
            role="Marketing Analyst"
          />
          <TestimonialCard
            quote="The interview prep questions were eerily specific to the role. Felt genuinely ready walking in."
            name="Priya S."
            role="Data Analyst"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 max-w-2xl mx-auto">
        <h2 className="font-display text-3xl text-ink text-center mb-8">
          Frequently asked <span className="text-highlight">questions.</span>
        </h2>
        <div>
          <FAQItem
            question="What file formats can I upload?"
            answer="CareerForge AI accepts resumes in PDF and DOCX format, up to 5MB."
          />
          <FAQItem
            question="Is my resume data private?"
            answer="Your resume and analysis history are tied to your account and only visible to you."
          />
          <FAQItem
            question="How accurate is the match score?"
            answer="The score is generated by AI comparing your resume text against the job description you provide — it's a strong directional signal, not a guarantee."
          />
          <FAQItem
            question="Is CareerForge AI free to use?"
            answer="Yes, you can create an account and analyze your resume at no cost."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-border px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-sans text-sm text-ink-muted">CareerForge AI</span>
          </div>
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} CareerForge AI. All rights reserved.
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Landing;
