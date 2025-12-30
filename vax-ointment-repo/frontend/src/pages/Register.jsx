import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // ✅ USER OR ADMIN

  const nav = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
        phone,
        role,  // ✅ IMPORTANT
      });

      toast.success("Account created! Please login.");
      nav("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>

      <form onSubmit={handleRegister} className="space-y-4">

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full p-3 border rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* ✅ ADMIN / USER SELECT */}
        <select
          className="w-full p-3 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">Register as User</option>
          <option value="admin">Register as Admin</option>
        </select>

        <button className="w-full p-3 bg-blue-600 text-white rounded-lg">
          Create Account
        </button>
      </form>

      <div className="mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </div>
    </div>
  );
}
