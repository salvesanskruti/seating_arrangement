import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ name: "", rows: 5, cols: 5, building: "", floor: "" });
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadRooms = async () => {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data);
    } catch {
      setError("Failed to load rooms.");
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "rows" || name === "cols" ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/rooms/${editingId}`, form);
      } else {
        await api.post("/rooms", form);
      }
      setForm({ name: "", rows: 5, cols: 5, building: "", floor: "" });
      setEditingId(null);
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save room.");
    }
  };

  const handleEdit = (room) => {
    setForm({ name: room.name, rows: room.rows, cols: room.cols, building: room.building || "", floor: room.floor || "" });
    setEditingId(room._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this room?")) return;
    await api.delete(`/rooms/${id}`);
    loadRooms();
  };

  const totalCapacity = rooms.reduce((sum, r) => sum + r.rows * r.cols, 0);

  return (
    <div className="page">
      <h1>Rooms / Halls</h1>
      {error && <p className="error-banner">{error}</p>}

      <form className="card form-grid" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Hall Name</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Hall A" required />
        </div>
        <div className="form-field">
          <label>Rows</label>
          <input type="number" name="rows" min="1" value={form.rows} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Seats per Row</label>
          <input type="number" name="cols" min="1" value={form.cols} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label>Building (optional)</label>
          <input name="building" value={form.building} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label>Floor (optional)</label>
          <input name="floor" value={form.floor} onChange={handleChange} />
        </div>
        <div className="form-field form-actions">
          <button type="submit" className="btn btn-primary">{editingId ? "Update Room" : "Add Room"}</button>
          {editingId && (
            <button type="button" className="btn" onClick={() => { setEditingId(null); setForm({ name: "", rows: 5, cols: 5, building: "", floor: "" }); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <p className="muted">Total capacity across all halls: <b>{totalCapacity}</b> seats</p>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Rows</th>
            <th>Seats/Row</th>
            <th>Capacity</th>
            <th>Building</th>
            <th>Floor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r._id}>
              <td>{r.name}</td>
              <td>{r.rows}</td>
              <td>{r.cols}</td>
              <td>{r.rows * r.cols}</td>
              <td>{r.building}</td>
              <td>{r.floor}</td>
              <td>
                <button className="btn-small" onClick={() => handleEdit(r)}>Edit</button>
                <button className="btn-small btn-danger" onClick={() => handleDelete(r._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {rooms.length === 0 && (
            <tr><td colSpan="7" className="muted">No rooms added yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
