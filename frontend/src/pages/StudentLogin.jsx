import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== "student") {
        setError("This account is not a student account. Use the Admin Login page instead.");
        setLoading(false);
        return;
      }
      const redirectTo = location.state?.from || "/student/my-seat";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="card login-card">
        <span className="login-role-badge login-role-student">🎓 Student</span>
        <h1>Student Login</h1>
        <p className="muted">Sign in to instantly find your exam hall and seat number.</p>
        {error && <p className="error-banner">{error}</p>}
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field full-width">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-field full-width">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-field form-actions full-width">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Please wait..." : "Sign In"}
            </button>
          </div>
        </form>
        <p className="login-switch">
          No account yet? <Link to="/student/signup">Sign up with your roll number</Link>
        </p>
        <p className="login-switch">
          Are you an admin? <Link to="/admin/login">Admin login</Link>
        </p>
      </div>
    </div>
  );
}
