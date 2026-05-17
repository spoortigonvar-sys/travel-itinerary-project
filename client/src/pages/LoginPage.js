import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
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
      const res = await API.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
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
          Your all-in-one trip planner to organize itineraries, track expenses,
          and create unforgettable memories.
        </p>
      </div>

      <div className="feature-list">
        <div className="feature-box">
          <div className="feature-icon">🗺️</div>
          <div>
            <h3>Plan Smart</h3>
            <p>Create detailed itineraries for every trip.</p>
          </div>
        </div>

        <div className="feature-box">
          <div className="feature-icon">💳</div>
          <div>
            <h3>Track Expenses</h3>
            <p>Keep every shared expense in one place.</p>
          </div>
        </div>

        <div className="feature-box">
          <div className="feature-icon">👥</div>
          <div>
            <h3>Travel Together</h3>
            <p>Split costs and manage travellers easily.</p>
          </div>
        </div>
      </div>

      <div className="mountain-bg"></div>
    </div>

    <div className="auth-right">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">✈</div>

        <h2>Login to Wandr</h2>
        <p className="login-subtitle">Glad to see you again! Please login to continue.</p>

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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div className="auth-options">
          <label className="remember">
            <input type="checkbox" />
            Remember me
          </label>
          <span className="forgot">Forgot Password?</span>
        </div>

        <button className="login-btn" type="submit">
          Login <span>→</span>
        </button>

        <div className="divider">
          <span></span>
          <p>OR</p>
          <span></span>
        </div>

        <button type="button" className="google-btn">
          <span>G</span> Continue with Google
        </button>

        <p className="auth-switch">
          New to Wandr? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  </div>
);
}