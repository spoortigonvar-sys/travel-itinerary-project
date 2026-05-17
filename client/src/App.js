import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TripProvider } from "./context/TripContext";
import Sidebar from "./components/layout/Sidebar";
import Toast from "./components/layout/Toast";

import Dashboard from "./pages/Dashboard";
import TripsPage from "./pages/TripsPage";
import NewTripPage from "./pages/NewTripPage";
import TripDetailPage from "./pages/TripDetailPage";
import ItineraryPage from "./pages/ItineraryPage";
import ExpensesPage from "./pages/ExpensesPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div
        className="main-area"
        style={{
          marginLeft: "260px",
          width: "calc(100% - 260px)",
          minHeight: "100vh",
        }}
      >
        <div className="topbar">
          <div className="topbar-title">
            <Routes>
              <Route path="/" element={"Dashboard"} />
              <Route path="/dashboard" element={"Dashboard"} />
              <Route path="/trips" element={"All Trips"} />
              <Route path="/trips/new" element={"Create New Trip"} />
              <Route path="/trips/:id" element={"Trip Overview"} />
              <Route path="/trips/:id/itinerary" element={"Itinerary Planner"} />
              <Route path="/trips/:id/expenses" element={"Expense Tracker"} />
            </Routes>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/new" element={<NewTripPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route path="/trips/:id/itinerary" element={<ItineraryPage />} />
          <Route path="/trips/:id/expenses" element={<ExpensesPage />} />
        </Routes>
      </div>

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <TripProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TripProvider>
  );
}