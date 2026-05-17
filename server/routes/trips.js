const router = require('express').Router();
const Trip = require('../models/Trip');
const ItineraryDay = require('../models/ItineraryDay');
const Expense = require('../models/Expense');

// GET all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single trip with stats
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const expenses = await Expense.find({ tripId: req.params.id });
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ ...trip.toObject(), totalSpent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create trip
router.post('/', async (req, res) => {
  try {
    const trip = new Trip(req.body);
    const saved = await trip.save();

    // Auto-create itinerary days
    const start = new Date(saved.startDate);
    const end = new Date(saved.endDate);
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const dayDocs = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dayDocs.push({ tripId: saved._id, day: i + 1, date: d, activities: [] });
    }
    await ItineraryDay.insertMany(dayDocs);

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update trip
router.put('/:id', async (req, res) => {
  try {
    const updated = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Trip not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE trip (cascade)
router.delete('/:id', async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    await ItineraryDay.deleteMany({ tripId: req.params.id });
    await Expense.deleteMany({ tripId: req.params.id });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
