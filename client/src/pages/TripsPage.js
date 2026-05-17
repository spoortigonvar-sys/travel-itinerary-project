import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsAPI } from '../api';
import { useTripContext } from '../context/TripContext';

const COLORS = ['#e8622a', '#457b9d', '#2d6a4f', '#8b5cf6', '#ec4899', '#f59e0b'];

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function fmtAmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setActiveTrip, showToast } = useTripContext();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);

    tripsAPI
      .getAll()
      .then((r) => setTrips(r.data))
      .catch(() => showToast('Failed to load trips', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const selectTrip = (trip) => {
    setActiveTrip(trip);
    showToast(`Active trip: ${trip.origin} → ${trip.destination}`, 'success');
    navigate(`/trips/${trip._id}`);
  };

  const deleteTrip = async (e, id) => {
    e.stopPropagation();

    if (!window.confirm('Delete this trip and all its data?')) return;

    await tripsAPI.delete(id);
    showToast('Trip deleted', 'default');
    load();
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading">
          <div className="spinner" /> Loading trips...
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="trips-grid">
        {trips.map((t, i) => {
          const color = COLORS[i % COLORS.length];

          const days =
            Math.round(
              (new Date(t.endDate) - new Date(t.startDate)) / 86400000
            ) + 1;

          const status = t.status || 'Planning';

          return (
            <div
              className="trip-card"
              key={t._id}
              onClick={() => selectTrip(t)}
            >
              <div className="trip-card-header" style={{ background: color }}>
                <span
                  style={{
                    fontFamily: "'DM Serif Display',serif",
                    fontSize: 22,
                    color: '#fff',
                  }}
                >
                  ✈ {t.destination}
                </span>
              </div>

              <div className="trip-card-body">
                <span className={`status-badge ${status.toLowerCase()}`}>
                  {status}
                </span>

                <div className="trip-card-dest">
                  {t.origin} → {t.destination}
                </div>

                <div className="trip-card-dates">
                  {fmtDate(t.startDate)} – {fmtDate(t.endDate)} · {days} days ·{' '}
                  {t.people} pax
                </div>
              </div>

              <div className="trip-card-footer">
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  Budget: {fmtAmt(t.budget)}
                </span>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={(e) => deleteTrip(e, t._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        <div className="new-trip-card" onClick={() => navigate('/trips/new')}>
          <span style={{ fontSize: 28 }}>＋</span>
          <span>Create New Trip</span>
        </div>
      </div>
    </div>
  );
}