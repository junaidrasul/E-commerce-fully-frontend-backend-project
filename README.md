# ShopVerse - FYP E-Commerce Platform

A full-featured multi-vendor e-commerce platform built with **React**, **Node.js**, and **MongoDB**.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, Recharts, Zustand
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (JSON Web Tokens)

## Features
- Multi-vendor marketplace (customers, sellers, admin)
- Beautiful responsive UI
- Product search, filter, sort
- Shopping cart & checkout
- Order management with real-time tracking
- Seller dashboard with analytics charts
- Product reviews & ratings
- Wishlist

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB — **required**. Use either:
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier), or
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) locally (`mongodb://127.0.0.1:27017/shopverse`)

Copy `backend/.env.example` to `backend/.env` and set a valid `MONGO_URI`. The placeholder host `cluster0.abcd123.mongodb.net` will not connect.

### 1. Setup Backend
```bash
cd backend
npm install
npm run seed
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Customer | customer@gmail.com | demo123 |
| Seller | seller@gmail.com | demo123 |
| Admin | admin@gmail.com | demo123 |

## Project Structure
```
fyp-ecommerce/
├── backend/
│   └── src/
│       ├── models/        # MongoDB schemas
│       ├── routes/        # API routes
│       ├── middleware/    # Auth, error handling
│       └── utils/         # Seeder, helpers
└── frontend/
    └── src/
        ├── components/    # Reusable UI components
        ├── pages/         # Page components
        ├── store/         # Zustand state management
        └── utils/         # API client, helpers
```
