// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// attach token if logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ------------------------------
// AUTH
// ------------------------------
export const registerUser = (payload) =>
  API.post("/auth/register", payload).then((res) => res.data);

export const loginUser = (payload) =>
  API.post("/auth/login", payload).then((res) => res.data);

// ------------------------------
// VACCINES
// ------------------------------
export const getVaccines = () =>
  API.get("/vaccines").then((res) => res.data);

// ------------------------------
// OINTMENTS
// ------------------------------
export const getOintments = () =>
  API.get("/ointments").then((res) => res.data);

// ------------------------------
// APPOINTMENTS
// ------------------------------
export const getAppointmentsByDate = (date) =>
  API.get(`/appointments/by-date/${date}`).then(res => res.data);

export const createAppointment = (payload) =>
  API.post("/appointments", payload).then((res) => res.data);

export const fetchMyAppointments = () =>
  API.get("/appointments").then((res) => res.data);

export const cancelAppointment = (id) =>
  API.put(`/appointments/cancel/${id}`).then((res) => res.data);

export const rescheduleAppointment = (id, payload) =>
  API.put(`/appointments/reschedule/${id}`, payload).then((res) => res.data);

// ------------------------------
// DASHBOARD
// ------------------------------
export const getDashboardStats = (opts = {}) =>
  API.get("/dashboard/stats", { params: opts }).then((res) => res.data);

// mark item as ordered
export const markItemOrdered = (type, id) =>
  API.patch(`/dashboard/mark-ordered/${type}/${id}`).then((res) => res.data);

// ------------------------------
// ✅ REMINDERS (ADMIN)
// ------------------------------
// get upcoming reminders, options: { all: true } or { days: N }
export const getUpcomingReminders = (opts = {}) => {
  const params = {};
  if (opts.all) params.all = 1;
  if (typeof opts.days !== "undefined") params.days = opts.days;
  return API.get("/appointments/reminders/upcoming", { params }).then(res => res.data);
};

export const sendReminderMail = (appointmentId) =>
  API.post("/appointments/reminders/send", {
    appointmentId,
  }).then((res) => res.data);



// ------------------------------
// ADMIN: STOCK
// ------------------------------
export const getAdminStock = () =>
  API.get("/admin/stock").then((res) => res.data);

export const updateStock = (id, payload) =>
  API.patch(`/admin/stock/${id}`, payload).then((res) => res.data);

// create vaccine (admin)
export const createVaccine = (payload) =>
  API.post("/vaccines", payload).then(res => res.data);

export default API;