# ⚡ MERN + Tailwind CSS Web Application

A full-stack application built with the **MERN** stack and **Tailwind CSS v4**:
- **M**ongoDB & Mongoose (Database & ODM)
- **E**xpress.js (Backend REST API Framework)
- **R**eact.js with Vite & **Tailwind CSS v4** (Fast, Responsive Frontend)
- **N**ode.js (JavaScript Runtime)

---

## 📁 Project Structure

```
.
├── client/                     # Frontend (React + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/         # Navbar, ItemCard, ItemModal, Toast
│   │   ├── services/           # api.js (REST API client)
│   │   ├── App.jsx             # Main Dashboard with search, filters & stats
│   │   ├── App.css             # Helper animations
│   │   ├── index.css           # Tailwind v4 import & custom theme tokens
│   │   └── main.jsx            # React root
│   ├── index.html              # HTML entry with Google Fonts
│   ├── package.json
│   └── vite.config.js          # Vite + @tailwindcss/vite plugin & API proxy
│
├── server/                     # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/             # db.js (MongoDB Mongoose connection)
│   │   ├── controllers/        # itemController.js (CRUD handlers)
│   │   ├── models/             # Item.js (Mongoose Schema)
│   │   ├── routes/             # itemRoutes.js, healthRoutes.js
│   │   ├── middleware/         # errorHandler.js
│   │   └── server.js           # Express main server entry
│   ├── .env                    # Environment config
│   └── package.json
│
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install All Dependencies

Run this single command from the project root to install dependencies for root, backend, and frontend:

```bash
npm run install:all
```

---

### 2. Configure MongoDB

By default, the server is configured to connect to a local MongoDB instance at `mongodb://localhost:27017/mern_app`.

If you are using **MongoDB Atlas** (Cloud):
1. Open [server/.env](file:///Users/macmini/Desktop/prroject/server/.env)
2. Replace `MONGO_URI` with your connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mern_app?retryWrites=true&w=majority
   ```

*(Note: The server also includes an automatic in-memory fallback, so the application runs and responds immediately even before database configuration!)*

---

### 3. Run the Application

Start both the **Backend API** and **Frontend React App** with one command:

```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Items Endpoint**: [http://localhost:5000/api/items](http://localhost:5000/api/items)

---

## 🛠️ Available Scripts

From the root directory:
- `npm run dev`: Runs both server and client concurrently in development mode with hot reloading.
- `npm run server`: Runs only the backend server with `nodemon`.
- `npm run client`: Runs only the frontend Vite development server.
- `npm run build`: Builds the production bundle of the React frontend into `client/dist`.
- `npm run install:all`: Installs dependencies for all parts of the application.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server uptime & MongoDB connection status |
| `GET` | `/api/items` | List items (supports `search`, `category`, `status`, `sort`) |
| `GET` | `/api/items/:id` | Get single item details |
| `POST` | `/api/items` | Create new item |
| `PUT` | `/api/items/:id` | Update item |
| `DELETE` | `/api/items/:id` | Delete item |
| `POST` | `/api/items/seed` | Populate database with sample starter data |
