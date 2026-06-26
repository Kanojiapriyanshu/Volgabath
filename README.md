# Plumbing & Sanitary Complaint Management System

Mobile-first full-stack web app for registering plumbing complaints, admin management, technician assignment, and **free WhatsApp messaging** via `wa.me` deep links.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (admin only)
- **Uploads:** Multer (`/uploads`)
- **WhatsApp:** `wa.me` links — opens WhatsApp Web/App with pre-filled message (₹0 cost)

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

Google Review link and WhatsApp message templates are configured in `client/src/utils/whatsapp.js`.

## WhatsApp Flow (Free)

1. Customer submits complaint → appears in admin dashboard
2. Admin assigns technician / marks resolved
3. Admin clicks **Send WhatsApp** → `https://wa.me/91XXXXXXXXXX?text=...` opens
4. Admin reviews the pre-filled message and presses **Send**

No Twilio or paid SMS/WhatsApp API required.

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
