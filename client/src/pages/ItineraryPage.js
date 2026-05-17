import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { itineraryAPI, tripsAPI } from '../api';
import { useTripContext } from '../context/TripContext';

const SLOTS = ['morning', 'afternoon', 'evening'];

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

function DayCard({ day, onAdd, onRemove }) {
  const [inputs, setInputs] = useState({ morning: '', afternoon: '', evening: '' });

  const handleAdd = (slot) => {
    const val = inputs[slot].trim();
    if (!val) return;
    onAdd(day._id, slot, val);
    setInputs((p) => ({ ...p, [slot]: '' }));
  };

  const actsBySlot = (slot) => day.activities.filter((a) => a.slot === slot);

  return (
    <div className="day-card">
      <div className="day-header">
        <div>
          <div className="day-num">Day {day.day}</div>
          <div className="day-date">{fmtDate(day.date)}</div>
        </div>
        <span className="day-count">{day.activities.length} activities</span>
      </div>

      {SLOTS.map((slot) => (
        <div className="slot-section" key={slot}>
          <span className={`slot-badge ${slot}`}>{slot}</span>
          <div className="act-chips">
            {actsBySlot(slot).map((a) => (
              <span className="act-chip" key={a._id}>
                {a.text}
                <span className="act-del" onClick={() => onRemove(day._id, a._id)}>×</span>
              </span>
            ))}
          </div>
          <div className="add-act-row">
            <input
              className="mini-input"
              value={inputs[slot]}
              placeholder={`Add ${slot} activity…`}
              onChange={(e) => setInputs((p) => ({ ...p, [slot]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd(slot)}
            />
            <button className="btn btn-outline btn-sm" onClick={() => handleAdd(slot)}>Add</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ItineraryPage() {
  const { id } = useParams();
  const { setActiveTrip, showToast } = useTripContext();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    itineraryAPI.getByTrip(id).then((r) => setDays(r.data)).finally(() => setLoading(false));
    tripsAPI.getOne(id).then((r) => setActiveTrip(r.data)).catch(() => {});
  };

  useEffect(load, [id]);

  const addActivity = async (dayId, slot, text) => {
    try {
      const { data } = await itineraryAPI.addActivity(dayId, { slot, text });
      setDays((prev) => prev.map((d) => (d._id === dayId ? data : d)));
    } catch {
      showToast('Failed to add activity', 'error');
    }
  };

  const removeActivity = async (dayId, actId) => {
    try {
      const { data } = await itineraryAPI.removeActivity(dayId, actId);
      setDays((prev) => prev.map((d) => (d._id === dayId ? data : d)));
    } catch {
      showToast('Failed to remove activity', 'error');
    }
  };

  if (loading) return <div className="page-content"><div className="loading"><div className="spinner" /> Loading itinerary…</div></div>;

  return (
    <div className="page-content">
      {days.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div className="empty-title">No days in itinerary</div>
          <p className="empty-text">Days are auto-created when you create a trip.</p>
        </div>
      )}
      {days.map((d) => (
        <DayCard key={d._id} day={d} onAdd={addActivity} onRemove={removeActivity} />
      ))}
    </div>
  );
}
