const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  slot: { type: String, enum: ['morning', 'afternoon', 'evening'], required: true },
  note: { type: String, default: '' },
});

const itineraryDaySchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    day: { type: Number, required: true },
    date: { type: Date, required: true },
    activities: [activitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ItineraryDay', itineraryDaySchema);
