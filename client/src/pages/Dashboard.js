import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { tripsAPI, expensesAPI, itineraryAPI } from '../api';
import { useTripContext } from '../context/TripContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const CAT_COLORS = { food: '#f59e0b', travel: '#3b82f6', hotel: '#ec4899', shopping: '#22c55e', activity: '#8b5cf6', other: '#6b7280' };
const CAT_LABELS = { food: 'Food', travel: 'Travel', hotel: 'Hotel', shopping: 'Shopping', activity: 'Activity', other: 'Other' };

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
}
function fmtAmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export default function Dashboard() {
  const { activeTrip, setActiveTrip } = useTripContext();
  const [expenses, setExpenses] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeTrip) return;
    setLoading(true);
    Promise.all([
      expensesAPI.getByTrip(activeTrip._id),
      itineraryAPI.getByTrip(activeTrip._id),
    ]).then(([expRes, itRes]) => {
      setExpenses(expRes.data);
      setItinerary(itRes.data);
    }).finally(() => setLoading(false));
  }, [activeTrip]);

  if (!activeTrip) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">🌍</div>
          <div className="empty-title">No active trip selected</div>
          <p className="empty-text">Go to All Trips to select or create one</p>
          <button className="btn btn-primary" onClick={() => navigate('/trips')}>View Trips</button>
        </div>
      </div>
    );
  }

  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = activeTrip.budget - spent;
  const pct = Math.min(100, Math.round((spent / activeTrip.budget) * 100)) || 0;
  const days = Math.round((new Date(activeTrip.endDate) - new Date(activeTrip.startDate)) / 86400000) + 1;

  const bycat = {};
  expenses.forEach((e) => { bycat[e.category] = (bycat[e.category] || 0) + e.amount; });

  const upcomingActs = [];
  itinerary.forEach((d) => {
    d.activities.forEach((a) => {
      upcomingActs.push({ day: d.day, date: d.date, slot: a.slot, act: a.text });
    });
  });

  const chartData = {
    labels: Object.keys(bycat).map((c) => CAT_LABELS[c] || c),
    datasets: [{ data: Object.values(bycat), backgroundColor: Object.keys(bycat).map((c) => CAT_COLORS[c] || '#999'), borderWidth: 2, borderColor: '#fff' }],
  };

  return (
    <div className="page-content">
      {loading && <div className="loading"><div className="spinner" />Loading...</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Destination</div>
          <div className="stat-val dest">{activeTrip.origin} → {activeTrip.destination}</div>
          <div className="stat-sub">{fmtDate(activeTrip.startDate)} – {fmtDate(activeTrip.endDate)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Budget</div>
          <div className="stat-val blue">{fmtAmt(activeTrip.budget)}</div>
          <div className="stat-sub">{activeTrip.people} traveller{activeTrip.people > 1 ? 's' : ''} · {days} days</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          <div className={`stat-val ${pct >= 85 ? 'red' : 'green'}`}>{fmtAmt(spent)}</div>
          <div className="stat-sub">{pct}% of budget used</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Remaining</div>
          <div className={`stat-val ${remaining < 0 ? 'red' : 'green'}`}>{fmtAmt(Math.abs(remaining))}{remaining < 0 ? ' over' : ''}</div>
          <div className="stat-sub">{fmtAmt(Math.round(remaining / Math.max(1, days)))} / day left</div>
        </div>
      </div>

      <div className="dash-grid">
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><div className="card-title">Budget Overview</div><span style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtAmt(spent)} of {fmtAmt(activeTrip.budget)}</span></div>
            <div className="card-body">
              <div className="budget-row"><span>Spent</span><span>{pct}%</span></div>
              <div className="budget-track"><div className={`budget-fill ${pct >= 85 ? 'warn' : ''}`} style={{ width: `${pct}%` }} /></div>
              <div className="cat-breakdown">
                {Object.entries(bycat).map(([c, a]) => (
                  <div className="cat-mini" key={c}>
                    <div className="cat-mini-label">{CAT_LABELS[c] || c}</div>
                    <div className="cat-mini-val">{fmtAmt(a)}</div>
                    <div className="cat-mini-pct">{Math.round(a / spent * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Upcoming Activities</div></div>
            <div className="card-body" style={{ padding: '8px 18px' }}>
              {upcomingActs.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0' }}>No activities planned yet.</p>}
              {upcomingActs.slice(0, 7).map((u, i) => (
                <div className="upcoming-item" key={i}>
                  <div className="day-pill">D{u.day}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{u.act}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.slot.charAt(0).toUpperCase() + u.slot.slice(1)} · {fmtDate(u.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header"><div className="card-title">Spending Breakdown</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {Object.keys(bycat).length > 0 ? (
              <>
                <Doughnut data={chartData} options={{ plugins: { legend: { display: false } }, cutout: '60%' }} style={{ maxWidth: 180 }} />
                <div className="legend">
                  {Object.entries(bycat).map(([c, a]) => (
                    <div className="legend-item" key={c}>
                      <div className="legend-dot" style={{ background: CAT_COLORS[c] }} />
                      <span style={{ flex: 1 }}>{CAT_LABELS[c] || c}</span>
                      <span style={{ fontWeight: 500 }}>{fmtAmt(a)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--muted)', padding: '20px 0' }}>No expenses yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
