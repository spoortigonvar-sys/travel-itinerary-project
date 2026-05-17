import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", form);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
  <div className="auth-screen">
    <div className="auth-left">
      <div className="brand-row">
        <div className="brand-plane">✈</div>
        <h1>Wandr</h1>
      </div>

      <div className="welcome-block">
        <p className="welcome-small">Welcome to</p>
        <h2>Wandr</h2>
        <div className="orange-line"></div>
        <p className="welcome-text">
          Create your account and start planning trips, tracking expenses,
          and managing travel memories beautifully.
        </p>
      </div>

      <div className="feature-list">
        <div className="feature-box">
          <div className="feature-icon">🧳</div>
          <div>
            <h3>Create Trips</h3>
            <p>Add destinations, dates, travellers and budgets.</p>
          </div>
        </div>

        <div className="feature-box">
          <div className="feature-icon">📅</div>
          <div>
            <h3>Build Itinerary</h3>
            <p>Plan morning, afternoon and evening activities.</p>
          </div>
        </div>

        <div className="feature-box">
          <div className="feature-icon">💰</div>
          <div>
            <h3>Split Expenses</h3>
            <p>Track who paid and who owes what.</p>
          </div>
        </div>
      </div>

      <div className="mountain-bg"></div>
    </div>

    <div className="auth-right">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">🌍</div>

        <h2>Create Account</h2>
        <p className="login-subtitle">Join Wandr and start planning your next journey.</p>

        <label>Full Name</label>
        <div className="input-box">
          <span>👤</span>
          <input
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <label>Email Address</label>
        <div className="input-box">
          <span>✉️</span>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <label>Password</label>
        <div className="input-box">
          <span>🔒</span>
          <input
            name="password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button className="login-btn" type="submit">
          Create Account <span>→</span>
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  </div>
);
}