# 🌍 Wandr – Trip Planner + Expense Tracker

A full MERN stack app to plan trips, manage itineraries, and track expenses.

---

## ⚙️ Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| MongoDB | v6+ | https://www.mongodb.com/try/download/community |
| npm | v9+ | (comes with Node.js) |

---

## 🚀 Setup & Run (3 steps)

### Step 1 — Install all dependencies

```bash
npm run install-all
```

This installs packages for root, server, and client automatically.

### Step 2 — Start MongoDB

Make sure MongoDB is running locally:

```bash
# macOS / Linux
mongod

# Windows (run as Administrator)
net start MongoDB

# Or if installed as a service, it may already be running
```

### Step 3 — Start the app

```bash
npm run dev
```

This starts both servers simultaneously:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:3000

Open http://localhost:3000 in your browser. ✅

---

## 📁 Project Structure

```
wandr/
├── package.json           ← Root: runs both servers with concurrently
│
├── server/                ← Node.js + Express API
│   ├── index.js           ← Entry point, connects to MongoDB
│   ├── .env               ← MongoDB URI and PORT
│   ├── models/
│   │   ├── Trip.js        ← Trip schema
│   │   ├── ItineraryDay.js← Itinerary day + activities schema
│   │   └── Expense.js     ← Expense schema
│   └── routes/
│       ├── trips.js       ← CRUD for trips
│       ├── itinerary.js   ← Add/remove activities
│       └── expenses.js    ← CRUD for expenses
│
└── client/                ← React frontend
    ├── public/index.html
    └── src/
        ├── App.js         ← Router + layout
        ├── index.css      ← All styles
        ├── api.js         ← Axios API helpers
        ├── context/
        │   └── TripContext.js  ← Global state
        ├── components/
        │   └── layout/
        │       ├── Sidebar.js
        │       └── Toast.js
        └── pages/
            ├── Dashboard.js
            ├── TripsPage.js
            ├── NewTripPage.js
            ├── TripDetailPage.js
            ├── ItineraryPage.js
            └── ExpensesPage.js
```

---

## 🔌 API Endpoints

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/trips | Get all trips |
| GET | /api/trips/:id | Get one trip |
| POST | /api/trips | Create trip (auto-creates itinerary days) |
| PUT | /api/trips/:id | Update trip |
| DELETE | /api/trips/:id | Delete trip + all data |

### Itinerary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/itinerary/trip/:tripId | Get all days for a trip |
| POST | /api/itinerary/:dayId/activity | Add activity to a day |
| DELETE | /api/itinerary/:dayId/activity/:actId | Remove activity |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/expenses/trip/:tripId | Get all expenses for a trip |
| POST | /api/expenses | Create expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |

---

## 🔧 Configuration

Edit `server/.env` to change settings:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/wandr
```

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Chart.js |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Styling | Custom CSS (no Tailwind needed) |
| Dev | Nodemon, Concurrently |

---

## 💡 Common Issues

**"MongoDB connection failed"**
→ Run `mongod` in a separate terminal first.

**Port 3000 already in use**
→ React will ask to use another port — press `y`.

**Port 5000 already in use**
→ Change `PORT=5001` in `server/.env`.

**"Cannot find module"**
→ Run `npm run install-all` again.
