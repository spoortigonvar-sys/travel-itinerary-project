import { NavLink, useNavigate } from "react-router-dom";
import { useTripContext } from "../../context/TripContext";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { activeTrip, setActiveTrip } = useTripContext();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    setActiveTrip(null);
    logout();
    navigate("/login");
  };

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "12px",
    color: isActive ? "#ffffff" : "#cbd5e1",
    background: isActive ? "rgba(232, 98, 42, 0.95)" : "transparent",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: isActive ? 700 : 500,
    marginBottom: "8px",
    transition: "0.2s ease",
  });

  return (
    <aside
      style={{
        width: "260px",
        minHeight: "100vh",
        background: "#111827",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 18px",
        boxSizing: "border-box",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <div>
        <div style={{ marginBottom: "34px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "30px",
              fontFamily: "'DM Serif Display', serif",
              color: "#ffffff",
            }}
          >
            Wandr
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              color: "#9ca3af",
              fontSize: "13px",
            }}
          >
            Trip Planner
          </p>
        </div>

        <nav>
          <NavLink to="/dashboard" style={linkStyle}>
            <span>🏠</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/trips" style={linkStyle}>
            <span>✈️</span>
            <span>All Trips</span>
          </NavLink>

          <NavLink to="/trips/new" style={linkStyle}>
            <span>➕</span>
            <span>Create Trip</span>
          </NavLink>

          {activeTrip && (
            <>
              <div
                style={{
                  margin: "24px 0 12px",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#6b7280",
                  fontWeight: 700,
                }}
              >
                Current Trip
              </div>

              <NavLink to={`/trips/${activeTrip._id}`} style={linkStyle}>
                <span>📍</span>
                <span>Trip Details</span>
              </NavLink>

              <NavLink
                to={`/trips/${activeTrip._id}/itinerary`}
                style={linkStyle}
              >
                <span>🗓️</span>
                <span>Itinerary</span>
              </NavLink>

              <NavLink
                to={`/trips/${activeTrip._id}/expenses`}
                style={linkStyle}
              >
                <span>💰</span>
                <span>Expenses</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      <div>
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "14px",
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#e8622a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name || "User"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#9ca3af",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "160px",
                }}
              >
                {user.email || "Logged in"}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            border: "none",
            background: "#ffffff",
            color: "#111827",
            padding: "11px 14px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}