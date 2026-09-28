const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const Room = require("../models/Room");
const Student = require("../models/Student");
const SeatingPlan = require("../models/SeatingPlan");
const { generateSeatingPlan } = require("../utils/seatingAlgorithm");

// POST /api/seating/generate
// body: { title, examDate, strategy, roomIds: [...] }  (roomIds optional -> use all rooms)
exports.generatePlan = async (req, res) => {
  try {
    const { title, examDate, strategy, roomIds } = req.body;

    const roomFilter = roomIds && roomIds.length ? { _id: { $in: roomIds } } : {};
    const rooms = await Room.find(roomFilter).sort({ name: 1 });
    const students = await Student.find();

    if (!rooms.length) {
      return res.status(400).json({ message: "No rooms available. Please add rooms first." });
    }
    if (!students.length) {
      return res.status(400).json({ message: "No students available. Please add/upload students first." });
    }

    const { roomPlans, unseatedStudents } = generateSeatingPlan({
      rooms,
      students,
      strategy: strategy || "no-adjacent-subject",
    });

    const plan = await SeatingPlan.create({
      title: title || "Exam Seating Plan",
      examDate: examDate || null,
      strategy: strategy || "no-adjacent-subject",
      rooms: roomPlans,
      unseatedStudents,
    });

    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await SeatingPlan.find()
      .select("title examDate strategy createdAt rooms.roomName unseatedStudents")
      .sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const plan = await SeatingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await SeatingPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json({ message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/seating/:id/export -> CSV of all seat allotments in the plan
exports.exportPlanCSV = async (req, res) => {
  try {
    const plan = await SeatingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const rows = [];
    plan.rooms.forEach((room) => {
      room.seats.forEach((seat) => {
        if (seat.rollNo) {
          rows.push({
            room: room.roomName,
            row: seat.row + 1,
            col: seat.col + 1,
            rollNo: seat.rollNo,
            name: seat.name,
            className: seat.className,
            subject: seat.subject,
          });
        }
      });
    });

    const parser = new Parser({
      fields: ["room", "row", "col", "rollNo", "name", "className", "subject"],
    });
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment(`${plan.title.replace(/\s+/g, "_")}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/seating/:id/export-pdf -> printable PDF with one page per hall
exports.exportPlanPDF = async (req, res) => {
  try {
    const plan = await SeatingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    res.header("Content-Type", "application/pdf");
    res.attachment(`${plan.title.replace(/\s+/g, "_")}.pdf`);

    const doc = new PDFDocument({ margin: 36, size: "A4", layout: "landscape" });
    doc.pipe(res);

    plan.rooms.forEach((room, roomIndex) => {
      if (roomIndex > 0) doc.addPage({ margin: 36, size: "A4", layout: "landscape" });

      doc.fontSize(18).text(plan.title, { align: "center" });
      doc.moveDown(0.2);
      doc.fontSize(13).text(
        `${room.roomName}  |  ${room.rows} rows x ${room.cols} seats  |  ${
          plan.examDate ? new Date(plan.examDate).toDateString() : ""
        }`,
        { align: "center" }
      );
      doc.moveDown(1);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom - 60;
      const cellW = pageWidth / room.cols;
      const cellH = Math.min(70, pageHeight / room.rows);
      const startX = doc.page.margins.left;
      const startY = doc.y;

      const seatAt = (r, c) => room.seats.find((s) => s.row === r && s.col === c);

      for (let r = 0; r < room.rows; r++) {
        for (let c = 0; c < room.cols; c++) {
          const seat = seatAt(r, c);
          const x = startX + c * cellW;
          const y = startY + r * cellH;

          doc.rect(x, y, cellW - 4, cellH - 4).stroke();

          if (seat && seat.rollNo) {
            doc
              .fontSize(9)
              .text(seat.rollNo, x + 4, y + 5, { width: cellW - 10 })
              .fontSize(8)
              .fillColor("#444444")
              .text(seat.name, x + 4, y + 18, { width: cellW - 10, ellipsis: true })
              .text(seat.subject || "", x + 4, y + 32, { width: cellW - 10, ellipsis: true })
              .fillColor("black");
          } else {
            doc
              .fontSize(8)
              .fillColor("#aaaaaa")
              .text("Empty", x + 4, y + cellH / 2 - 8, { width: cellW - 10 })
              .fillColor("black");
          }
        }
      }
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/seating/:id/swap-seats
// body: { roomIndex, seatA: {row, col}, seatB: {row, col} }
// Manually swap the occupants of two seats within the same hall (e.g. to
// fix a last-minute conflict, accommodate a special-needs request, or
// override an automatic allocation). Works even if one seat is empty.
exports.swapSeats = async (req, res) => {
  try {
    const { roomIndex, seatA, seatB } = req.body;
    if (
      roomIndex === undefined ||
      !seatA ||
      !seatB ||
      seatA.row === undefined ||
      seatA.col === undefined ||
      seatB.row === undefined ||
      seatB.col === undefined
    ) {
      return res.status(400).json({ message: "roomIndex, seatA {row,col} and seatB {row,col} are required" });
    }

    const plan = await SeatingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const room = plan.rooms[roomIndex];
    if (!room) return res.status(404).json({ message: "Room not found in this plan" });

    const findSeat = (r, c) => room.seats.find((s) => s.row === r && s.col === c);
    const seat1 = findSeat(seatA.row, seatA.col);
    const seat2 = findSeat(seatB.row, seatB.col);
    if (!seat1 || !seat2) {
      return res.status(400).json({ message: "One or both seat coordinates are invalid for this hall" });
    }

    // Swap occupant fields, keep row/col fixed to their grid position
    const temp = {
      student: seat1.student,
      rollNo: seat1.rollNo,
      name: seat1.name,
      subject: seat1.subject,
      className: seat1.className,
    };
    seat1.student = seat2.student;
    seat1.rollNo = seat2.rollNo;
    seat1.name = seat2.name;
    seat1.subject = seat2.subject;
    seat1.className = seat2.className;

    seat2.student = temp.student;
    seat2.rollNo = temp.rollNo;
    seat2.name = temp.name;
    seat2.subject = temp.subject;
    seat2.className = temp.className;

    plan.markModified("rooms");
    await plan.save();

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/seating/my-seat  (student only — uses req.user.rollNo)
// Scans every seating plan (most recent first) for a seat matching the
// logged-in student's roll number, so they don't have to search manually.
exports.getMySeat = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;
    if (!rollNo) {
      return res.status(400).json({ message: "Your account has no roll number on file." });
    }

    const plans = await SeatingPlan.find().sort({ createdAt: -1 });
    const results = [];

    for (const plan of plans) {
      for (const room of plan.rooms) {
        const seat = room.seats.find(
          (s) => s.rollNo && s.rollNo.toLowerCase() === rollNo.toLowerCase()
        );
        if (seat) {
          results.push({
            planId: plan._id,
            planTitle: plan.title,
            examDate: plan.examDate,
            room: room.roomName,
            row: seat.row + 1,
            col: seat.col + 1,
            subject: seat.subject,
            className: seat.className,
            createdAt: plan.createdAt,
          });
          break; // only one seat per plan
        }
      }
    }

    res.json({ rollNo, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/seating/:id/lookup?rollNo=XYZ -> find a student's seat in a plan
exports.lookupStudentInPlan = async (req, res) => {
  try {
    const { rollNo } = req.query;
    if (!rollNo) return res.status(400).json({ message: "rollNo query param required" });

    const plan = await SeatingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    for (const room of plan.rooms) {
      const seat = room.seats.find(
        (s) => s.rollNo && s.rollNo.toLowerCase() === rollNo.toLowerCase()
      );
      if (seat) {
        return res.json({
          found: true,
          room: room.roomName,
          row: seat.row + 1,
          col: seat.col + 1,
          name: seat.name,
          subject: seat.subject,
          className: seat.className,
        });
      }
    }
    res.json({ found: false, message: "Roll number not found in this plan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
