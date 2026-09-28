import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState({ rooms: 0, students: 0, plans: 0, capacity: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [roomsRes, studentsRes, plansRes] = await Promise.all([
          api.get("/rooms"),
          api.get("/students"),
          api.get("/seating"),
        ]);
        const capacity = roomsRes.data.reduce((sum, r) => sum + r.rows * r.cols, 0);
        setStats({
          rooms: roomsRes.data.length,
          students: studentsRes.data.length,
          plans: plansRes.data.length,
          capacity,
        });
      } catch (err) {
        setError("Could not reach the backend API. Make sure the server is running.");
      }
    };
    load();
  }, []);

  return (
    <div className="page">
      <h1>Dashboard</h1>
      {error && <p className="error-banner">{error}</p>}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.rooms}</div>
          <div className="stat-label">Rooms / Halls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.capacity}</div>
          <div className="stat-label">Total Seat Capacity</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.students}</div>
          <div className="stat-label">Registered Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.plans}</div>
          <div className="stat-label">Seating Plans Generated</div>
        </div>
      </div>

      <div className="quick-links">
        <Link className="btn" to="/rooms">+ Manage Rooms</Link>
        <Link className="btn" to="/students">+ Manage Students</Link>
        <Link className="btn btn-primary" to="/generate">⚡ Generate Seating Plan</Link>
      </div>

      <div className="card info-card">
        <h3>How it works</h3>
        <ol>
          <li>Add exam halls with row × column dimensions under <b>Rooms</b>.</li>
          <li>Add students individually or bulk-upload a CSV under <b>Students</b>.</li>
          <li>Go to <b>Generate Plan</b>, choose a spacing strategy, and generate.</li>
          <li>View hall-wise seat charts, look up a roll number, or export CSV under <b>View Plans</b>.</li>
        </ol>
      </div>
    </div>
  );
}
