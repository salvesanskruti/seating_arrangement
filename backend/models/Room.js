const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Hall A"
    rows: { type: Number, required: true, min: 1 },
    cols: { type: Number, required: true, min: 1 }, // seats per row
    building: { type: String, default: "" },
    floor: { type: String, default: "" },
  },
  { timestamps: true }
);

// virtual capacity
RoomSchema.virtual("capacity").get(function () {
  return this.rows * this.cols;
});
RoomSchema.set("toJSON", { virtuals: true });
RoomSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Room", RoomSchema);
