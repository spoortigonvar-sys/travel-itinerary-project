const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    people: { type: Number, required: true, min: 1, default: 1 },
    budget: { type: Number, required: true, min: 0, default: 0 },
    coverColor: { type: String, default: '#e8622a' },
    status: {
  type: String,
  enum: ["Planning", "Ongoing", "Completed", "Cancelled"],
  default: "Planning",
},travellers: {
  type: [String],
  default: [],
},
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
