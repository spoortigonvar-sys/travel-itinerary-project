import { useTripContext } from '../../context/TripContext';

export default function Toast() {
  const { toasts } = useTripContext();
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}
