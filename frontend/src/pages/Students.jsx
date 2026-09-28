import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ rollNo: "", name: "", className: "", subject: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef();

  const loadStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch {
      setError("Failed to load students.");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/students", form);
      setForm({ rollNo: "", name: "", className: "", subject: "" });
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add student.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    await api.delete(`/students/${id}`);
    loadStudents();
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete ALL students? This cannot be undone.")) return;
    await api.delete("/students/all");
    loadStudents();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const file = fileInputRef.current.files[0];
    if (!file) {
      setError("Please choose a CSV file first.");
      return;
    }
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await api.post("/students/upload-csv", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(`Imported ${res.data.count} students.`);
      fileInputRef.current.value = "";
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "CSV upload failed.");
    }
  };

  return (
    <div className="page">
      <h1>Students</h1>
      {error && <p className="error-banner">{error}</p>}
      {message && <p className="success-banner">{message}</p>}

      <div className="two-col">
        <form className="card form-grid" onSubmit={handleSubmit}>
          <h3>Add Student</h3>
          <div className="form-field">
            <label>Roll No</label>
            <input name="rollNo" value={form.rollNo} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Class / Section</label>
            <input name="className" value={form.className} onChange={handleChange} placeholder="e.g. 10-A" />
          </div>
          <div className="form-field">
            <label>Subject / Course</label>
            <input name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Mathematics" />
          </div>
          <div className="form-field form-actions">
            <button type="submit" className="btn btn-primary">Add Student</button>
          </div>
        </form>

        <form className="card" onSubmit={handleUpload}>
          <h3>Bulk Upload (CSV)</h3>
          <p className="muted">Columns: <code>rollNo,name,className,subject</code></p>
          <input type="file" accept=".csv" ref={fileInputRef} />
          <div className="form-actions" style={{ marginTop: "0.75rem" }}>
            <button type="submit" className="btn btn-primary">Upload CSV</button>
          </div>
        </form>
      </div>

      <div className="table-header-row">
        <p className="muted">Total students: <b>{students.length}</b></p>
        {students.length > 0 && (
          <button className="btn-small btn-danger" onClick={handleDeleteAll}>Delete All</button>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Class</th>
            <th>Subject</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.rollNo}</td>
              <td>{s.name}</td>
              <td>{s.className}</td>
              <td>{s.subject}</td>
              <td>
                <button className="btn-small btn-danger" onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr><td colSpan="5" className="muted">No students added yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
