import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");

  const loadPlans = async () => {
    try {
      const res = await api.get("/seating");
      setPlans(res.data);
    } catch {
      setError("Failed to load seating plans.");
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    await api.delete(`/seating/${id}`);
    loadPlans();
  };

  return (
    <div className="page">
      <h1>Seating Plans</h1>
      {error && <p className="error-banner">{error}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Exam Date</th>
            <th>Strategy</th>
            <th>Halls</th>
            <th>Unseated</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>{p.examDate ? new Date(p.examDate).toLocaleDateString() : "-"}</td>
              <td>{p.strategy}</td>
              <td>{p.rooms?.map((r) => r.roomName).join(", ")}</td>
              <td>{p.unseatedStudents?.length || 0}</td>
              <td>{new Date(p.createdAt).toLocaleString()}</td>
              <td>
                <Link className="btn-small" to={`/plans/${p._id}`}>View</Link>
                <button className="btn-small btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {plans.length === 0 && (
            <tr><td colSpan="7" className="muted">No seating plans generated yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
