import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function MySeat() {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/seating/my-seat")
      .then((res) => setResults(res.data.results))
      .catch((err) => setError(err.response?.data?.message || "Failed to load your seat information."));
  }, []);

  return (
    <div className="page">
      <h1>My Seat</h1>
      <p className="muted">
        Welcome, {user?.name} (Roll No: <b>{user?.rollNo}</b>)
      </p>
      {error && <p className="error-banner">{error}</p>}

      {results === null && !error && <p>Loading...</p>}

      {results && results.length === 0 && (
        <div className="card">
          <p>No seating plan has been generated for you yet. Check back closer to your exam date.</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="my-seat-list">
          {results.map((r) => (
            <div key={r.planId} className="card my-seat-card">
              <div className="my-seat-card-header">
                <h3>{r.planTitle}</h3>
                <span className="muted">{r.examDate ? new Date(r.examDate).toLocaleDateString() : "No date set"}</span>
              </div>
              <div className="my-seat-details">
                <div className="my-seat-detail">
                  <span className="muted">Hall</span>
                  <div className="my-seat-value">{r.room}</div>
                </div>
                <div className="my-seat-detail">
                  <span className="muted">Row</span>
                  <div className="my-seat-value">{r.row}</div>
                </div>
                <div className="my-seat-detail">
                  <span className="muted">Seat</span>
                  <div className="my-seat-value">{r.col}</div>
                </div>
                <div className="my-seat-detail">
                  <span className="muted">Subject</span>
                  <div className="my-seat-value">{r.subject}</div>
                </div>
              </div>
              <Link className="btn-small" to={`/plans/${r.planId}`}>View full hall chart →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
