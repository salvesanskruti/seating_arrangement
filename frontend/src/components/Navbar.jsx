import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar-brand">🎓 Exam Seating System</NavLink>
      <nav className="navbar-links">
        {user?.role === "admin" && (
          <>
            <NavLink to="/admin/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/rooms" className={linkClass}>Rooms</NavLink>
            <NavLink to="/students" className={linkClass}>Students</NavLink>
            <NavLink to="/generate" className={linkClass}>Generate Plan</NavLink>
          </>
        )}
        {user?.role === "student" && (
          <NavLink to="/student/my-seat" className={linkClass}>My Seat</NavLink>
        )}
        <NavLink to="/plans" className={linkClass}>View Plans</NavLink>
      </nav>
      <div className="navbar-auth">
        {user ? (
          <>
            <span className="muted">
              {user.role === "admin" ? "🛡️" : "🎓"} {user.name}
            </span>
            <button className="btn-small" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/admin/login" className="btn-small">Admin Login</NavLink>
            <NavLink to="/student/login" className="btn-small">Student Login</NavLink>
          </>
        )}
      </div>
    </header>
  );
}
