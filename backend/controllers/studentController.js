const { parse } = require("csv-parse/sync");
const Student = require("../models/Student");

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ rollNo: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { rollNo, name, className, subject } = req.body;
    if (!rollNo || !name) {
      return res.status(400).json({ message: "rollNo and name are required" });
    }
    const student = await Student.create({ rollNo, name, className, subject });
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAllStudents = async (req, res) => {
  try {
    await Student.deleteMany({});
    res.json({ message: "All students deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk upload via CSV file (multipart/form-data field name: "file")
// Expected columns: rollNo,name,className,subject
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "CSV file is required" });

    const records = parse(req.file.buffer.toString("utf-8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records.length) {
      return res.status(400).json({ message: "CSV file is empty or malformed" });
    }

    const docs = records.map((r) => ({
      rollNo: r.rollNo || r.RollNo || r.roll_no || "",
      name: r.name || r.Name || "",
      className: r.className || r.Class || r.class || "General",
      subject: r.subject || r.Subject || "General",
    }));

    const invalid = docs.filter((d) => !d.rollNo || !d.name);
    if (invalid.length) {
      return res.status(400).json({
        message: `${invalid.length} row(s) missing rollNo or name`,
      });
    }

    const inserted = await Student.insertMany(docs);
    res.status(201).json({ count: inserted.length, students: inserted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
