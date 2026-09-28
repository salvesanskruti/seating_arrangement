/**
 * Exam Seating Allocation Algorithm
 * --------------------------------
 * Strategies supported:
 *  1. "no-adjacent-subject" - interleaves students from different subjects/classes
 *     so that, as much as possible, no two horizontally or vertically adjacent
 *     seats hold students from the same subject/class (anti-cheating spacing).
 *  2. "alternate-class"     - strictly alternates between two dominant groups
 *     (e.g. Class A / Class B) seat by seat.
 *  3. "sequential"          - simple roll-number order, row-major fill (no spacing rules).
 *
 * Input:
 *   rooms:    [{ _id, name, rows, cols }]   sorted in the order they should be filled
 *   students: [{ _id, rollNo, name, subject, className }]
 *   strategy: one of the strings above
 *
 * Output:
 *   {
 *     roomPlans: [{ room, roomName, rows, cols, seats: [{row,col,student...}] }],
 *     unseatedStudents: [...]   // if total capacity < number of students
 *   }
 */

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "General";
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

/**
 * Interleave students from multiple groups (by subject or class) in round-robin
 * fashion so consecutive students in the output list come from different groups
 * wherever possible. Groups are sorted by rollNo internally for orderliness.
 */
function interleaveGroups(groups) {
  const groupKeys = Object.keys(groups);
  groupKeys.forEach((k) =>
    groups[k].sort((a, b) => (a.rollNo > b.rollNo ? 1 : a.rollNo < b.rollNo ? -1 : 0))
  );

  // Sort groups largest-first so big groups get spread out evenly
  groupKeys.sort((a, b) => groups[b].length - groups[a].length);

  const queues = groupKeys.map((k) => [...groups[k]]);
  const result = [];
  let remaining = queues.reduce((s, q) => s + q.length, 0);

  while (remaining > 0) {
    for (let i = 0; i < queues.length; i++) {
      if (queues[i].length > 0) {
        result.push(queues[i].shift());
        remaining--;
      }
    }
  }
  return result;
}

/**
 * Given an ordered list of students (already interleaved) and a room's
 * dimensions, fill the grid row-major (left-to-right, top-to-bottom), then
 * run a local "swap" pass to fix any accidental same-subject adjacency
 * (checks left neighbor and top neighbor).
 */
function fillRoomGrid(rows, cols, studentQueue) {
  const total = rows * cols;
  const grid = new Array(total).fill(null);

  for (let i = 0; i < total; i++) {
    if (studentQueue.length === 0) break;
    grid[i] = studentQueue.shift();
  }

  const idx = (r, c) => r * cols + c;
  const conflictsWithNeighbors = (i, student) => {
    if (!student) return false;
    const r = Math.floor(i / cols);
    const c = i % cols;
    const left = c > 0 ? grid[idx(r, c - 1)] : null;
    const top = r > 0 ? grid[idx(r - 1, c)] : null;
    const right = c < cols - 1 ? grid[idx(r, c + 1)] : null;
    const bottom = r < rows - 1 ? grid[idx(r + 1, c)] : null;
    return [left, top, right, bottom].some(
      (n) => n && n.subject === student.subject
    );
  };

  // Local repair pass: try swapping conflicting seats with a later non-conflicting one
  for (let i = 0; i < total; i++) {
    if (!grid[i]) continue;
    if (conflictsWithNeighbors(i, grid[i])) {
      for (let j = i + 1; j < total; j++) {
        if (!grid[j]) continue;
        // tentatively swap
        const a = grid[i];
        const b = grid[j];
        grid[i] = b;
        grid[j] = a;
        const stillBad = conflictsWithNeighbors(i, grid[i]) || conflictsWithNeighbors(j, grid[j]);
        if (!stillBad) break; // keep swap
        // revert
        grid[i] = a;
        grid[j] = b;
      }
    }
  }

  return grid.map((student, i) => ({
    row: Math.floor(i / cols),
    col: i % cols,
    student: student ? student._id : null,
    rollNo: student ? student.rollNo : null,
    name: student ? student.name : null,
    subject: student ? student.subject : null,
    className: student ? student.className : null,
  }));
}

function generateSeatingPlan({ rooms, students, strategy = "no-adjacent-subject" }) {
  let orderedStudents;

  if (strategy === "sequential") {
    orderedStudents = [...students].sort((a, b) =>
      a.rollNo > b.rollNo ? 1 : a.rollNo < b.rollNo ? -1 : 0
    );
  } else if (strategy === "alternate-class") {
    const groups = groupBy(students, "className");
    orderedStudents = interleaveGroups(groups);
  } else {
    // default: no-adjacent-subject
    const groups = groupBy(students, "subject");
    orderedStudents = interleaveGroups(groups);
  }

  const queue = [...orderedStudents];
  const roomPlans = [];

  for (const room of rooms) {
    if (queue.length === 0) {
      roomPlans.push({
        room: room._id,
        roomName: room.name,
        rows: room.rows,
        cols: room.cols,
        seats: fillRoomGrid(room.rows, room.cols, []),
      });
      continue;
    }
    const seats = fillRoomGrid(room.rows, room.cols, queue);
    roomPlans.push({
      room: room._id,
      roomName: room.name,
      rows: room.rows,
      cols: room.cols,
      seats,
    });
  }

  const unseatedStudents = queue.map((s) => ({
    rollNo: s.rollNo,
    name: s.name,
    subject: s.subject,
    className: s.className,
  }));

  return { roomPlans, unseatedStudents };
}

module.exports = { generateSeatingPlan, groupBy, interleaveGroups, fillRoomGrid };
