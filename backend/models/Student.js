const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    rollNo: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    className: { type: String, default: "General", trim: true }, // class/section
    subject: { type: String, default: "General", trim: true }, // subject/course code
  },
  { timestamps: true }
);

StudentSchema.index({ rollNo: 1 }, { unique: false });

module.exports = mongoose.model("Student", StudentSchema);
