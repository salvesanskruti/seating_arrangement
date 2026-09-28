import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Students from "./pages/Students";
import GenerateSeating from "./pages/GenerateSeating";
import Plans from "./pages/Plans";
import ViewSeating from "./pages/ViewSeating";
import AdminLogin from "./pages/AdminLogin";
import StudentLogin from "./pages/StudentLogin";
import StudentSignup from "./pages/StudentSignup";
import MySeat from "./pages/MySeat";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/:id" element={<ViewSeating />} />

          {/* Admin-only */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute role="admin"><Rooms /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute role="admin"><Students /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute role="admin"><GenerateSeating /></ProtectedRoute>} />

          {/* Student-only */}
          <Route path="/student/my-seat" element={<ProtectedRoute role="student"><MySeat /></ProtectedRoute>} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
