import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripsAPI } from '../api';
import { useTripContext } from '../context/TripContext';

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeTrip, setActiveTrip, showToast } = useTripContext();

  useEffect(() => {
    if (!activeTrip || activeTrip._id !== id) {
      tripsAPI.getOne(id).then((r) => setActiveTrip(r.data)).catch(() => {
        showToast('Trip not found', 'error');
        navigate('/trips');
      });
    }
  }, [id]);

  if (!activeTrip || activeTrip._id !== id) {
    return <div className="page-content"><div className="loading"><div className="spinner" /> Loading...</div></div>;
  }

  const days = Math.round((new Date(activeTrip.endDate) - new Date(activeTrip.startDate)) / 86400000) + 1;

  return (
    <div className="page-content" style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28 }}>{activeTrip.origin} → {activeTrip.destination}</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{fmtDate(activeTrip.startDate)} – {fmtDate(activeTrip.endDate)}</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card"><div className="stat-label">Duration</div><div className="stat-val">{days}</div><div className="stat-sub">days</div></div>
        <div className="stat-card"><div className="stat-label">Travellers</div><div className="stat-val">{activeTrip.people}</div><div className="stat-sub">people</div></div>
        <div className="stat-card"><div className="stat-label">Budget</div><div className="stat-val blue" style={{ fontSize: 18 }}>₹{Number(activeTrip.budget).toLocaleString('en-IN')}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/trips/${id}/itinerary`)}>
          <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>View Itinerary</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Plan daily activities</div>
          </div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/trips/${id}/expenses`)}>
          <div className="card-body" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💰</div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Track Expenses</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Monitor your budget</div>
          </div>
        </div>
      </div>
    </div>
  );
}
