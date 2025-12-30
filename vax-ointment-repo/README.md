
# Online Vaccine & Ointment Management System

Full-stack project with:
- Backend: Node.js, Express, MongoDB
- Frontend: React (Vite), Tailwind CSS
- Features: user auth, forgot/reset password, vaccine & ointment inventory, appointment scheduling, email reminders, admin panel.

## Setup (quick)
See `/backend/.env.example` and `/frontend/.env.example` for environment variables.

### Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --port 3000
```
