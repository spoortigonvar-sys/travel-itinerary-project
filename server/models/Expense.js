const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    desc: {
      type: String,
      required: true,
    },

    paidBy: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "food",
    },

    amount: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    split: {
      type: Boolean,
      default: false,
    },

    splitBetween: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);