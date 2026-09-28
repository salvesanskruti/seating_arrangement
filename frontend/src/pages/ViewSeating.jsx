import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import SeatGrid from "../components/SeatGrid";
import { useAuth } from "../context/AuthContext";

export default function ViewSeating() {
  const { id } = useParams();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [swapMode, setSwapMode] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null); // { roomIndex, row, col }
  const [swapMessage, setSwapMessage] = useState("");

  const loadPlan = () => {
    api.get(`/seating/${id}`).then((res) => setPlan(res.data)).catch(() => setError("Failed to load plan."));
  };

  useEffect(() => {
    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!rollNo) return;
    const res = await api.get(`/seating/${id}/lookup`, { params: { rollNo } });
    setLookupResult(res.data);
  };

  const handleExportCSV = () => {
    window.open(`${api.defaults.baseURL}/seating/${id}/export`, "_blank");
  };

  const handleExportPDF = () => {
    window.open(`${api.defaults.baseURL}/seating/${id}/export-pdf`, "_blank");
  };

  // Called when an admin, in swap mode, clicks a seat cell.
  const handleSeatClick = async (roomIndex, row, col) => {
    if (!swapMode) return;
    setSwapMessage("");

    if (!selectedSeat) {
      setSelectedSeat({ roomIndex, row, col });
      return;
    }

    if (selectedSeat.roomIndex !== roomIndex) {
      setSwapMessage("You can only swap two seats within the same hall.");
      setSelectedSeat({ roomIndex, row, col });
      return;
    }

    if (selectedSeat.row === row && selectedSeat.col === col) {
      setSelectedSeat(null); // clicked same seat twice -> deselect
      return;
    }

    try {
      const res = await api.post(`/seating/${id}/swap-seats`, {
        roomIndex,
        seatA: { row: selectedSeat.row, col: selectedSeat.col },
        seatB: { row, col },
      });
      setPlan(res.data);
      setSwapMessage("Seats swapped successfully.");
    } catch (err) {
      setSwapMessage(err.response?.data?.message || "Swap failed.");
    } finally {
      setSelectedSeat(null);
    }
  };

  if (error) return <div className="page"><p className="error-banner">{error}</p></div>;
  if (!plan) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="plan-header no-print">
        <div>
          <h1>{plan.title}</h1>
          <p className="muted">
            {plan.examDate ? new Date(plan.examDate).toLocaleDateString() : "No date set"} · Strategy: {plan.strategy}
          </p>
        </div>
        <div className="plan-actions">
          {user && (
            <button
              className={"btn" + (swapMode ? " btn-primary" : "")}
              onClick={() => { setSwapMode((s) => !s); setSelectedSeat(null); setSwapMessage(""); }}
            >
              {swapMode ? "✓ Exit Swap Mode" : "✏️ Manual Seat Override"}
            </button>
          )}
          <button className="btn" onClick={() => window.print()}>🖨️ Print</button>
          <button className="btn" onClick={handleExportPDF}>📄 Export PDF</button>
          <button className="btn btn-primary" onClick={handleExportCSV}>⬇️ Export CSV</button>
        </div>
      </div>

      {swapMode && (
        <div className="warning-banner no-print">
          Manual override active: click any two seats in the <b>same hall</b> to swap their occupants.
          {selectedSeat && " First seat selected — click a second seat to complete the swap."}
          {swapMessage && <span> — {swapMessage}</span>}
        </div>
      )}

      <form className="card lookup-card no-print" onSubmit={handleLookup}>
        <label>Find a student's seat — Roll No:</label>
        <input value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="e.g. R2024001" />
        <button type="submit" className="btn-small">Search</button>
        {lookupResult && (
          <span className="lookup-result">
            {lookupResult.found
              ? ` → ${lookupResult.name} is in ${lookupResult.room}, Row ${lookupResult.row}, Seat ${lookupResult.col}`
              : " → Not found in this plan"}
          </span>
        )}
      </form>

      {plan.unseatedStudents?.length > 0 && (
        <div className="warning-banner no-print">
          ⚠️ {plan.unseatedStudents.length} student(s) could not be seated — total hall capacity was insufficient.
        </div>
      )}

      {plan.rooms.map((roomPlan, roomIndex) => (
        <SeatGrid
          key={roomPlan.roomName}
          roomPlan={roomPlan}
          swapMode={swapMode}
          selectedSeat={selectedSeat && selectedSeat.roomIndex === roomIndex ? selectedSeat : null}
          onSeatClick={(row, col) => handleSeatClick(roomIndex, row, col)}
        />
      ))}
    </div>
  );
}
