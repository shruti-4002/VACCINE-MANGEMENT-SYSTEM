import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function OtpLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState(null);
  const navigate = useNavigate();

  const sendOtp = async () => {
    const res = await API.post("/auth/login-otp", { email });
    setServerOtp(res.data.otp);
    toast.info(`OTP (Demo): ${res.data.otp}`);
  };

  const verifyOtp = () => {
    if (otp == serverOtp) {
      toast.success("OTP Login Successful");
      navigate("/");
    } else {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-12 border rounded">
      <h2 className="text-xl font-bold mb-4">OTP Login</h2>

      <input
        placeholder="Email"
        className="w-full p-2 border mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={sendOtp} className="w-full bg-blue-600 text-white p-2 mb-3">
        Send OTP
      </button>

      {serverOtp && (
        <>
          <input
            placeholder="Enter OTP"
            className="w-full p-2 border mb-3"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button onClick={verifyOtp} className="w-full bg-green-600 text-white p-2">
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}
