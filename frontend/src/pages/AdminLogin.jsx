import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const [needsSetup, setNeedsSetup] = useState(null); // null = checking
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, registerAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api
      .get("/auth/bootstrap-status")
      .then((res) => setNeedsSetup(res.data.needsSetup))
      .catch(() => setNeedsSetup(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = needsSetup ? await registerAdmin(name, email, password) : await login(email, password);
      if (user.role !== "admin") {
        setError("This account is not an admin account. Use the Student Login page instead.");
        setLoading(false);
        return;
      }
      const redirectTo = location.state?.from || "/admin/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (needsSetup === null) return <div className="page">Loading...</div>;

  return (
    <div className="page login-page">
      <div className="card login-card">
        <span className="login-role-badge login-role-admin">🛡️ Admin</span>
        <h1>{needsSetup ? "Create Admin Account" : "Admin Login"}</h1>
        <p className="muted">
          {needsSetup
            ? "No admin account exists yet — set one up to manage rooms, students, and seating plans."
            : "Sign in to manage rooms, students, and generate seating plans."}
        </p>
        {error && <p className="error-banner">{error}</p>}
        <form onSubmit={handleSubmit} className="form-grid">
          {needsSetup && (
            <div className="form-field full-width">
              <label>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-field full-width">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-field full-width">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="form-field form-actions full-width">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Please wait..." : needsSetup ? "Create Account & Sign In" : "Sign In"}
            </button>
          </div>
        </form>
        <p className="login-switch">
          Are you a student? <Link to="/student/login">Student login</Link>
        </p>
      </div>
    </div>
  );
}
