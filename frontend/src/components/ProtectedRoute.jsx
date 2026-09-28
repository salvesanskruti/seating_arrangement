import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usage: <ProtectedRoute role="admin"> or <ProtectedRoute role="student">
// Omit `role` to just require any logged-in user.
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page">Loading...</div>;

  if (!user) {
    const loginPath = role === "student" ? "/student/login" : "/admin/login";
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="page">
        <p className="error-banner">
          This page is only available to {role} accounts. You're signed in as a {user.role}.
        </p>
      </div>
    );
  }

  return children;
}
