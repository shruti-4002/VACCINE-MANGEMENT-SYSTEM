import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login({ setToken, setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("user");

  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });

      const user = res.data.user;
      const token = res.data.token;

      // ✅ ROLE SECURITY CHECK
      if (loginType === "admin" && user.role !== "admin") {
        toast.error("You are not an Admin!");
        return;
      }

      if (loginType === "user" && user.role === "admin") {
        toast.error("Admin must login via Admin mode!");
        return;
      }

      // ✅ STORE TOKEN + USER
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user); // ✅ THIS LINE WAS MISSING EARLIER (NOW FIXED)

      toast.success("Login Successful!");

      // ✅ REDIRECT
      if (user.role === "admin") nav("/dashboard");
      else nav("/");

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {/* LOGIN TYPE */}
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setLoginType("user")}
          className={`px-4 py-2 rounded ${
            loginType === "user" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          User
        </button>

        <button
          type="button"
          onClick={() => setLoginType("admin")}
          className={`px-4 py-2 rounded ${
            loginType === "admin" ? "bg-red-600 text-white" : "bg-gray-200"
          }`}
        >
          Admin
        </button>
      </div>

      <form onSubmit={handle} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 rounded border"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 rounded border"
          required
        />

        <button className="w-full p-3 bg-sky-600 text-white rounded-lg">
          Login as {loginType === "admin" ? "Admin" : "User"}
        </button>
      </form>

      <div className="mt-4 text-sm flex justify-between">
        <Link to="/register" className="text-sky-600">
          Create account
        </Link>
      </div>
    </div>
  );
}
