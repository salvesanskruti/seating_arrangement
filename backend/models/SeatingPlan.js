const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema(
  {
    row: Number,
    col: Number,
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    rollNo: { type: String, default: null },
    name: { type: String, default: null },
    subject: { type: String, default: null },
    className: { type: String, default: null },
  },
  { _id: false }
);

const RoomPlanSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    roomName: String,
    rows: Number,
    cols: Number,
    seats: [SeatSchema], // flattened grid, length = rows*cols
  },
  { _id: false }
);

const SeatingPlanSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Exam Seating Plan" },
    examDate: { type: Date },
    strategy: {
      type: String,
      enum: ["no-adjacent-subject", "alternate-class", "sequential"],
      default: "no-adjacent-subject",
    },
    rooms: [RoomPlanSchema],
    unseatedStudents: [
      {
        rollNo: String,
        name: String,
        subject: String,
        className: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeatingPlan", SeatingPlanSchema);
