import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function GenerateSeating() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [title, setTitle] = useState("Mid-Term Examination");
  const [examDate, setExamDate] = useState("");
  const [strategy, setStrategy] = useState("no-adjacent-subject");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/rooms").then((res) => {
      setRooms(res.data);
      setSelectedRoomIds(res.data.map((r) => r._id));
    });
  }, []);

  const toggleRoom = (id) => {
    setSelectedRoomIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/seating/generate", {
        title,
        examDate: examDate || null,
        strategy,
        roomIds: selectedRoomIds,
      });
      navigate(`/plans/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate seating plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Generate Seating Plan</h1>
      {error && <p className="error-banner">{error}</p>}

      <form className="card form-grid" onSubmit={handleGenerate}>
        <div className="form-field">
          <label>Exam Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Exam Date</label>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Spacing Strategy</label>
          <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
            <option value="no-adjacent-subject">No two adjacent seats — same subject</option>
            <option value="alternate-class">Alternate by class/section</option>
            <option value="sequential">Sequential (roll number order, no spacing)</option>
          </select>
        </div>

        <div className="form-field full-width">
          <label>Halls to Include</label>
          <div className="checkbox-list">
            {rooms.map((r) => (
              <label key={r._id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedRoomIds.includes(r._id)}
                  onChange={() => toggleRoom(r._id)}
                />
                {r.name} ({r.rows * r.cols} seats)
              </label>
            ))}
            {rooms.length === 0 && <p className="muted">No rooms available — add rooms first.</p>}
          </div>
        </div>

        <div className="form-field form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading || rooms.length === 0}>
            {loading ? "Generating..." : "Generate Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}
