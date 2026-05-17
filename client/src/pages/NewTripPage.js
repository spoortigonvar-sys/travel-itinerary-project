import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tripsAPI } from "../api";
import { useTripContext } from "../context/TripContext";

export default function NewTripPage() {
  const navigate = useNavigate();
  const { setActiveTrip, showToast } = useTripContext();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    startDate: "",
    endDate: "",
    people: "2",
    budget: "",
    status: "Planning",
  });

  const [travellers, setTravellers] = useState(["", ""]);

  const setF = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updatePeopleCount = (count) => {
    const n = Math.max(1, parseInt(count, 10) || 1);

    setF("people", String(n));

    setTravellers((prev) => {
      const next = [...prev];

      while (next.length < n) {
        next.push("");
      }

      return next.slice(0, n);
    });
  };

  const setTraveller = (index, value) => {
    setTravellers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (
      !form.origin.trim() ||
      !form.destination.trim() ||
      !form.startDate ||
      !form.endDate ||
      !form.people ||
      !form.budget
    ) {
      showToast("Please fill all trip details", "error");
      return;
    }

    const travellerNames = travellers.map((name, index) =>
      name.trim() || `Person ${index + 1}`
    );

    const payload = {
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      people: Number(form.people),
      budget: Number(form.budget),
      status: form.status,
      travellers: travellerNames,
    };

    console.log("TRIP PAYLOAD:", payload);

    try {
      setSaving(true);

      const res = await tripsAPI.create(payload);

      setActiveTrip(res.data);
      showToast("Trip created successfully!", "success");

      navigate(`/trips/${res.data._id}/expenses`);
    } catch (err) {
      console.error("CREATE TRIP ERROR:", err);
      console.log("CREATE TRIP RESPONSE:", err.response?.data);

      showToast(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create trip",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <h1 className="page-title">Plan a New Trip</h1>
      <p className="page-subtitle">Fill in the details to get started</p>

      <form onSubmit={submit} className="card" style={{ padding: 24 }}>
        <div className="section-title">Trip Details</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">From</label>
            <input
              className="form-input"
              value={form.origin}
              onChange={(e) => setF("origin", e.target.value)}
              placeholder="e.g. Bangalore"
            />
          </div>

          <div className="form-group">
            <label className="form-label">To</label>
            <input
              className="form-input"
              value={form.destination}
              onChange={(e) => setF("destination", e.target.value)}
              placeholder="e.g. Goa"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              className="form-input"
              type="date"
              value={form.startDate}
              onChange={(e) => setF("startDate", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              className="form-input"
              type="date"
              value={form.endDate}
              onChange={(e) => setF("endDate", e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Number of Travellers</label>
            <input
              className="form-input"
              type="number"
              min="1"
              max="20"
              value={form.people}
              onChange={(e) => updatePeopleCount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Budget (₹)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={form.budget}
              onChange={(e) => setF("budget", e.target.value)}
              placeholder="15000"
            />
          </div>
        </div>

        <div className="form-row full">
          <div className="form-group">
            <label className="form-label">Trip Status</label>
            <select
              className="form-input"
              value={form.status}
              onChange={(e) => setF("status", e.target.value)}
            >
              <option value="Planning">Planning</option>
              <option value="Booked">Booked</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <hr style={{ margin: "22px 0", border: "0.5px solid #e5e7eb" }} />

        <div className="section-title">Traveller Names</div>

        <div className="form-row">
          {travellers.map((traveller, index) => (
            <div className="form-group" key={index}>
              <label className="form-label">Person {index + 1}</label>
              <input
                className="form-input"
                value={traveller}
                onChange={(e) => setTraveller(index, e.target.value)}
                placeholder={`Person ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <p style={{ color: "#6b7280", fontSize: 13 }}>
          💡 Names are used to track who paid what and calculate who owes whom
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/trips")}
          >
            Cancel
          </button>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "✈ Create Trip"}
          </button>
        </div>
      </form>
    </div>
  );
}