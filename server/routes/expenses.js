const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// GET expenses by trip
// URL: /api/expenses/trip/:tripId
router.get("/trip/:tripId", async (req, res) => {
  try {
    const expenses = await Expense.find({
      trip: req.params.tripId,
    }).sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    console.error("GET EXPENSES ERROR:", err);
    res.status(500).json({ message: "Failed to load expenses" });
  }
});

// CREATE expense
// URL: /api/expenses
router.post("/", async (req, res) => {
  try {
    const {
      tripId,
      desc,
      description,
      paidBy,
      category,
      amount,
      date,
      split,
      splitBetween,
    } = req.body;

    if (!tripId || !(desc || description) || !paidBy || !amount || !date) {
      return res.status(400).json({
        message: "Trip, description, paid by, amount and date are required",
      });
    }

    const expense = await Expense.create({
      trip: tripId,
      desc: desc || description,
      paidBy,
      category: category || "food",
      amount: Number(amount),
      date,
      split: Boolean(split),
      splitBetween: splitBetween || [],
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error("CREATE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to create expense" });
  }
});

// UPDATE expense
// URL: /api/expenses/:id
router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch (err) {
    console.error("UPDATE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
});

// DELETE expense
// URL: /api/expenses/:id
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("DELETE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

module.exports = router;
