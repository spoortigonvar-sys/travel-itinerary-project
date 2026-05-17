import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { expensesAPI, tripsAPI } from "../api";
import { useTripContext } from "../context/TripContext";
import PaymentModal from "./PaymentModal";

const CAT_LABELS = {
  food: "Food",
  travel: "Travel",
  hotel: "Hotel",
  shopping: "Shopping",
  activity: "Activity",
  other: "Other",
};

const CAT_CLASS = {
  food: "cat-food",
  travel: "cat-travel",
  hotel: "cat-hotel",
  shopping: "cat-shopping",
  activity: "cat-activity",
  other: "cat-other",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function fmtAmt(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

const EMPTY_FORM = {
  desc: "",
  category: "food",
  amount: "",
  date: "",
  split: false,
  paidBy: "",
  splitBetween: [],
};

export default function ExpensesPage() {
  const { id } = useParams();
  const { activeTrip, setActiveTrip, showToast } = useTripContext();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [payment, setPayment] = useState(null);

  const travellers = activeTrip?.travellers || [];

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [expRes, tripRes] = await Promise.all([
        expensesAPI.getByTrip(id),
        tripsAPI.getOne(id),
      ]);

      setExpenses(expRes.data || []);
      setActiveTrip(tripRes.data);
    } catch (err) {
      console.error("LOAD EXPENSES ERROR:", err);
      showToast("Failed to load expenses", "error");
    } finally {
      setLoading(false);
    }
  }, [id, setActiveTrip, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const setF = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openAddForm = () => {
    setForm({
      ...EMPTY_FORM,
      paidBy: travellers[0] || "",
      splitBetween: travellers,
    });
    setShowForm(true);
  };

  const toggleSplitPerson = (name) => {
    setForm((prev) => {
      const exists = prev.splitBetween.includes(name);

      return {
        ...prev,
        splitBetween: exists
          ? prev.splitBetween.filter((person) => person !== name)
          : [...prev.splitBetween, name],
      };
    });
  };

  const handleSplitToggle = (checked) => {
    setForm((prev) => ({
      ...prev,
      split: checked,
      splitBetween: checked ? [...travellers] : [],
    }));
  };

  const saveExpense = async () => {
    if (
      !form.desc.trim() ||
      !form.amount ||
      !form.date ||
      !form.paidBy
    ) {
      showToast("Please fill description, amount, date and paid by", "error");
      return;
    }

    if (Number(form.amount) <= 0) {
      showToast("Amount must be greater than 0", "error");
      return;
    }

    if (form.split && form.splitBetween.length === 0) {
      showToast("Select at least one person to split", "error");
      return;
    }

    const payload = {
      desc: form.desc.trim(),
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      paidBy: form.paidBy,
      split: form.split,
      splitBetween: form.split
        ? form.splitBetween.length > 0
          ? form.splitBetween
          : travellers
        : [],
      tripId: id,
    };

    try {
      setSaving(true);

      await expensesAPI.create(payload);

      showToast("Expense added!", "success");

      setForm({
        ...EMPTY_FORM,
        paidBy: travellers[0] || "",
        splitBetween: travellers,
      });

      setShowForm(false);
      load();
    } catch (err) {
      console.error("SAVE EXPENSE ERROR:", err);
      console.log("SAVE EXPENSE RESPONSE:", err.response?.data);

      showToast(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save expense",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (expId) => {
    if (!window.confirm("Remove this expense?")) return;

    try {
      await expensesAPI.delete(expId);

      setExpenses((prev) => prev.filter((expense) => expense._id !== expId));
      showToast("Expense removed", "success");
    } catch (err) {
      console.error("REMOVE EXPENSE ERROR:", err);
      showToast("Failed to remove expense", "error");
    }
  };

  const calcSettlements = () => {
    if (!travellers.length) return [];

    const balance = {};

    travellers.forEach((person) => {
      balance[person] = 0;
    });

    expenses.forEach((expense) => {
      if (!expense.split || !expense.paidBy) return;

      const members =
        expense.splitBetween?.length > 0 ? expense.splitBetween : travellers;

      const share = Number(expense.amount || 0) / members.length;

      if (balance[expense.paidBy] !== undefined) {
        balance[expense.paidBy] += Number(expense.amount || 0);
      }

      members.forEach((member) => {
        if (balance[member] !== undefined) {
          balance[member] -= share;
        }
      });
    });

    const creditors = [];
    const debtors = [];

    Object.entries(balance).forEach(([name, amount]) => {
      if (amount > 0.5) {
        creditors.push({ name, amount });
      } else if (amount < -0.5) {
        debtors.push({ name, amount: -amount });
      }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const payAmount = Math.min(
        creditors[creditorIndex].amount,
        debtors[debtorIndex].amount
      );

      transactions.push({
        from: debtors[debtorIndex].name,
        to: creditors[creditorIndex].name,
        amount: Math.round(payAmount),
      });

      creditors[creditorIndex].amount -= payAmount;
      debtors[debtorIndex].amount -= payAmount;

      if (creditors[creditorIndex].amount < 0.5) creditorIndex++;
      if (debtors[debtorIndex].amount < 0.5) debtorIndex++;
    }

    return transactions;
  };

  const perPersonSpend = () => {
    const spend = {};

    travellers.forEach((person) => {
      spend[person] = 0;
    });

    expenses.forEach((expense) => {
      if (expense.paidBy && spend[expense.paidBy] !== undefined) {
        spend[expense.paidBy] += Number(expense.amount || 0);
      }
    });

    return spend;
  };

  const spent = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const budget = Number(activeTrip?.budget || 0);
  const remaining = budget - spent;
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const settlements = calcSettlements();
  const ppSpend = perPersonSpend();

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading">
          <div className="spinner" /> Loading expenses…
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div
        className="stats-grid"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          marginBottom: 16,
        }}
      >
        <div className="stat-card">
          <div className="stat-label">Budget</div>
          <div className="stat-val blue">{fmtAmt(budget)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Spent</div>
          <div className="stat-val">{fmtAmt(spent)}</div>
          <div className="stat-sub">{pct}% of budget</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Remaining</div>
          <div className={`stat-val ${remaining < 0 ? "red" : "green"}`}>
            {fmtAmt(Math.abs(remaining))}
            {remaining < 0 ? " over" : ""}
          </div>
        </div>
      </div>

      {travellers.length > 1 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div className="card">
            <div className="card-header">
              <div className="card-title">💳 Who Paid</div>
            </div>

            <div className="card-body" style={{ padding: "10px 18px" }}>
              {travellers.map((person) => {
                const amount = ppSpend[person] || 0;
                const percent = spent > 0 ? Math.round((amount / spent) * 100) : 0;

                return (
                  <div
                    key={person}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "7px 0",
                      borderBottom: "0.5px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "var(--sidebar)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {person.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {person}
                      </div>

                      <div
                        style={{
                          height: 4,
                          background: "#f3f4f6",
                          borderRadius: 4,
                          marginTop: 4,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${percent}%`,
                            background: "var(--accent)",
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        minWidth: 70,
                        textAlign: "right",
                      }}
                    >
                      {fmtAmt(amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">⚖️ Settlements</div>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                Who owes whom
              </span>
            </div>

            <div className="card-body" style={{ padding: "10px 18px" }}>
              {settlements.length === 0 ? (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    padding: "12px 0",
                  }}
                >
                  ✅ All settled up!
                </p>
              ) : (
                settlements.map((settlement, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "0.5px solid var(--border)",
                    }}
                  >
                    <div style={{ fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: "#dc2626" }}>
                        {settlement.from}
                      </span>
                      <span style={{ color: "var(--muted)", margin: "0 6px" }}>
                        owes
                      </span>
                      <span style={{ fontWeight: 600, color: "var(--accent2)" }}>
                        {settlement.to}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {fmtAmt(settlement.amount)}
                      </span>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setPayment(settlement)}
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title">Add Expense</div>

            <button
              className="btn btn-outline btn-sm"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          <div className="card-body">
            <div className="form-row full" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  value={form.desc}
                  onChange={(e) => setF("desc", e.target.value)}
                  placeholder="e.g. Hotel check-in"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Paid By</label>
                <select
                  className="form-input"
                  value={form.paidBy}
                  onChange={(e) => setF("paidBy", e.target.value)}
                >
                  <option value="">Select person</option>
                  {travellers.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={form.category}
                  onChange={(e) => setF("category", e.target.value)}
                >
                  {Object.entries(CAT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setF("date", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setF("amount", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {travellers.length > 1 && (
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    marginBottom: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.split}
                    onChange={(e) => handleSplitToggle(e.target.checked)}
                  />
                  <span style={{ fontWeight: 500 }}>Split this expense</span>
                </label>

                {form.split && (
                  <div style={{ paddingLeft: 24 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginBottom: 6,
                      }}
                    >
                      Split between:
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {travellers.map((person) => (
                        <label
                          key={person}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            fontSize: 13,
                            background: form.splitBetween.includes(person)
                              ? "#fff5f2"
                              : "var(--bg)",
                            border: `1px solid ${
                              form.splitBetween.includes(person)
                                ? "var(--accent)"
                                : "var(--border)"
                            }`,
                            borderRadius: 6,
                            padding: "4px 10px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={form.splitBetween.includes(person)}
                            onChange={() => toggleSplitPerson(person)}
                          />
                          {person}
                        </label>
                      ))}
                    </div>

                    {form.amount && form.splitBetween.length > 0 && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          marginTop: 8,
                        }}
                      >
                        Each person pays:{" "}
                        <strong>
                          {fmtAmt(
                            Math.round(
                              Number(form.amount) / form.splitBetween.length
                            )
                          )}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={saveExpense}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div
                      className="spinner"
                      style={{ borderTopColor: "#fff" }}
                    />{" "}
                    Saving…
                  </>
                ) : (
                  "Add Expense"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">All Expenses ({expenses.length})</div>

          {!showForm && (
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={openAddForm}
            >
              + Add Expense
            </button>
          )}
        </div>

        <div style={{ padding: "0 18px" }}>
          {expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💸</div>
              <div className="empty-title">No expenses yet</div>
              <p className="empty-text">
                Click "Add Expense" to start tracking
              </p>
            </div>
          ) : (
            <>
              <table className="exp-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Paid By</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>
                        <span style={{ fontWeight: 500 }}>
                          {expense.desc || expense.description}
                        </span>

                        {expense.split && (
                          <span className="split-badge">
                            ÷ {expense.splitBetween?.length || "?"}
                          </span>
                        )}
                      </td>

                      <td>
                        {expense.paidBy ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <span
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: "var(--sidebar)",
                                color: "#fff",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 700,
                              }}
                            >
                              {expense.paidBy.charAt(0).toUpperCase()}
                            </span>
                            {expense.paidBy}
                          </span>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>—</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`cat-badge ${
                            CAT_CLASS[expense.category] || "cat-other"
                          }`}
                        >
                          {CAT_LABELS[expense.category] || expense.category}
                        </span>
                      </td>

                      <td style={{ color: "var(--muted)", fontSize: 12 }}>
                        {fmtDate(expense.date)}
                      </td>

                      <td className="amt-cell">{fmtAmt(expense.amount)}</td>

                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          type="button"
                          onClick={() => remove(expense._id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="total-row">
                <span className="total-label">Total Expenses</span>
                <span className="total-val">{fmtAmt(spent)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {payment && (
        <PaymentModal
          payment={payment}
          onClose={() => setPayment(null)}
          onSuccess={() => {
            setPayment(null);
            showToast(
              `✅ Payment of ${fmtAmt(payment.amount)} marked done!`,
              "success"
            );
          }}
        />
      )}
    </div>
  );
}