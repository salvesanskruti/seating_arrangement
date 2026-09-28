// Renders one room/hall as a printable grid of seats.
const subjectColor = (subject) => {
  if (!subject) return "#f1f1f1";
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 88%)`;
};

export default function SeatGrid({ roomPlan, swapMode = false, selectedSeat = null, onSeatClick }) {
  const { roomName, rows, cols, seats } = roomPlan;

  const grid = [];
  for (let r = 0; r < rows; r++) {
    const rowSeats = [];
    for (let c = 0; c < cols; c++) {
      const seat = seats.find((s) => s.row === r && s.col === c);
      rowSeats.push(seat);
    }
    grid.push(rowSeats);
  }

  return (
    <div className="seat-grid-wrapper">
      <h3 className="seat-grid-title">{roomName} <span className="seat-grid-meta">({rows} × {cols} = {rows * cols} seats)</span></h3>
      <div className="seat-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {grid.flat().map((seat, i) => {
          const isSelected = selectedSeat && selectedSeat.row === seat.row && selectedSeat.col === seat.col;
          return (
            <div
              key={i}
              className={
                "seat-cell" +
                (seat && seat.rollNo ? "" : " seat-empty") +
                (swapMode ? " seat-swappable" : "") +
                (isSelected ? " seat-selected" : "")
              }
              style={{ background: isSelected ? undefined : (seat && seat.rollNo ? subjectColor(seat.subject) : undefined) }}
              title={seat && seat.rollNo ? `${seat.name} (${seat.subject})` : "Empty"}
              onClick={() => swapMode && onSeatClick && onSeatClick(seat.row, seat.col)}
            >
              {seat && seat.rollNo ? (
                <>
                  <div className="seat-roll">{seat.rollNo}</div>
                  <div className="seat-name">{seat.name}</div>
                  <div className="seat-subject">{seat.subject}</div>
                </>
              ) : (
                <div className="seat-empty-label">Empty</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
