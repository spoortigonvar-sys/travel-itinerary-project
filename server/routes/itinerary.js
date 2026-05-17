const router = require('express').Router();
const ItineraryDay = require('../models/ItineraryDay');

// GET all days for a trip
router.get('/trip/:tripId', async (req, res) => {
  try {
    const days = await ItineraryDay.find({ tripId: req.params.tripId }).sort({ day: 1 });
    res.json(days);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add activity to a day
router.post('/:dayId/activity', async (req, res) => {
  try {
    const day = await ItineraryDay.findById(req.params.dayId);
    if (!day) return res.status(404).json({ error: 'Day not found' });
    day.activities.push(req.body);
    await day.save();
    res.json(day);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE activity from a day
router.delete('/:dayId/activity/:activityId', async (req, res) => {
  try {
    const day = await ItineraryDay.findById(req.params.dayId);
    if (!day) return res.status(404).json({ error: 'Day not found' });
    day.activities = day.activities.filter((a) => a._id.toString() !== req.params.activityId);
    await day.save();
    res.json(day);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
