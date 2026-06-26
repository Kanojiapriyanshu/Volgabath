# Plumbing & Sanitary Complaint Management System

Mobile-first full-stack web app for registering plumbing complaints, admin management, technician assignment, and WhatsApp notifications via Twilio.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (admin only)
- **Uploads:** Multer (`/uploads`)
- **WhatsApp:** Twilio WhatsApp API (falls back to console logs if not configured)

## Project Structure

```
plumbing-cms/
├── client/          # React frontend (port 5173)
├── server/          # Express API (port 5000)
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI in `.env`)

## Setup

### 1. Backend

```bash
cd plumbing-cms/server
npm install
cp .env.example .env   # Edit with your values
npm run seed           # Creates admin + sample technicians
npm run dev
```

**Default admin credentials (after seed):**
- Email: `admin@plumbing.com`
- Password: `admin123`

### 2. Frontend

```bash
cd plumbing-cms/client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

Edit `server/.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_FROM` | e.g. `whatsapp:+14155238886` |
| `GOOGLE_REVIEW_LINK` | Google review URL for resolution message |

If Twilio credentials are missing or placeholders, WhatsApp messages are logged to the server console instead.

## API Overview

### Public
- `POST /api/complaints` — Submit complaint (multipart/form-data, optional `photo`)
- `GET /api/complaints/:complaintId` — Track status

### Admin (Bearer token)
- `POST /api/admin/login`
- `GET /api/admin/complaints` — Query: `status`, `date`, `search`
- `GET /api/admin/complaints/:id`
- `PUT /api/admin/complaints/:id/assign` — Body: `{ technicianId }`
- `PUT /api/admin/complaints/:id/resolve`
- `GET|POST /api/admin/technicians`
- `PUT|DELETE /api/admin/technicians/:id`

## Complaint ID Format

Auto-generated: `PLM-YYYY-XXXX` (e.g. `PLM-2026-0001`)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Customer homepage + complaint form |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Complaints & technicians management |
| `/admin/complaints/:id` | Complaint detail, assign, resolve |

## Production Build

```bash
cd client && npm run build
cd ../server && npm start
```

Serve the Vite `dist` folder via a static host or proxy it through Express as needed.

## License

MIT
