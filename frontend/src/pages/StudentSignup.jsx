import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function StudentSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signupStudent } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signupStudent(name, email, password, rollNo);
      navigate("/student/my-seat", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="card login-card">
        <span className="login-role-badge login-role-student">🎓 Student</span>
        <h1>Student Sign Up</h1>
        <p className="muted">
          Your roll number must already be on the exam roster (added by your admin) to sign up.
        </p>
        {error && <p className="error-banner">{error}</p>}
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field full-width">
            <label>Roll Number</label>
            <input value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="e.g. R001" required />
          </div>
          <div className="form-field full-width">
            <label>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
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
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        </form>
        <p className="login-switch">
          Already have an account? <Link to="/student/login">Student login</Link>
        </p>
      </div>
    </div>
  );
}
