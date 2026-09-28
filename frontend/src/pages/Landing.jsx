import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: "🏛️",
    title: "Multi-Hall Allocation",
    desc: "Add any number of halls with custom rows × columns, and let the system fill them in order automatically.",
  },
  {
    icon: "🛡️",
    title: "Anti-Cheating Spacing",
    desc: "No two adjacent seats — left, right, up, or down — get students from the same subject or class.",
  },
  {
    icon: "🖨️",
    title: "Printable Hall Charts",
    desc: "Color-coded, print-ready seat grids for invigilators, plus door notices in one click.",
  },
  {
    icon: "📄",
    title: "PDF & CSV Export",
    desc: "Download hall-wise PDFs or a full CSV of every allotment for notice boards and ERP systems.",
  },
  {
    icon: "🔍",
    title: "Instant Seat Lookup",
    desc: "Students search their roll number, or just log in to see their seat automatically.",
  },
  {
    icon: "✏️",
    title: "Manual Overrides",
    desc: "Admins can swap any two seats after generation to handle last-minute changes.",
  },
];

const steps = [
  { n: "01", title: "Add Halls", desc: "Enter hall names and dimensions — capacity is calculated for you." },
  { n: "02", title: "Add Students", desc: "Add one by one or bulk-upload a CSV roster." },
  { n: "03", title: "Generate Plan", desc: "Pick a spacing rule and generate a conflict-free layout in seconds." },
  { n: "04", title: "Print & Share", desc: "Export PDF/CSV, print hall charts, or let students look up their own seat." },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">🎓 Exam Seating Arrangement System</span>
          <h1>
            Fair, conflict-free <span className="hero-highlight">exam seating</span> in minutes
          </h1>
          <p className="hero-subtitle">
            Automatically distribute students across exam halls with anti-cheating
            spacing rules, printable hall-wise charts, and instant seat lookup —
            no spreadsheets, no guesswork.
          </p>
          <div className="hero-actions">
            {!user && (
              <>
                <Link to="/admin/login" className="btn btn-primary btn-lg">
                  🛡️ Admin Login
                </Link>
                <Link to="/student/login" className="btn btn-lg">
                  🎓 Student Login
                </Link>
              </>
            )}
            {user && user.role === "admin" && (
              <Link to="/admin/dashboard" className="btn btn-primary btn-lg">
                Go to Admin Dashboard →
              </Link>
            )}
            {user && user.role === "student" && (
              <Link to="/student/my-seat" className="btn btn-primary btn-lg">
                Find My Seat →
              </Link>
            )}
            <Link to="/plans" className="btn-link">
              View published seating plans →
            </Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-grid">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className={"hero-seat" + (i % 5 === 0 ? " hero-seat-a" : i % 3 === 0 ? " hero-seat-b" : "")} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Everything you need to run exam day smoothly</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt">
        <h2 className="section-title">How it works</h2>
        <div className="steps-grid">
          {steps.map((s) => (
            <div key={s.n} className="step-card">
              <div className="step-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to organize your next exam?</h2>
        <p>Admins set up halls and generate plans. Students sign up to find their seat instantly.</p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link to="/admin/login" className="btn btn-primary btn-lg">Admin Login</Link>
          <Link to="/student/signup" className="btn btn-lg">Student Sign Up</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Exam Seating Arrangement System — built with the MERN stack.</p>
      </footer>
    </div>
  );
}
