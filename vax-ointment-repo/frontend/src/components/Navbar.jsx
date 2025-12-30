
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">Vax & Ointment</Link>
        <div className="flex items-center gap-4">
          <Link to="/vaccines" className="text-sm">Vaccines</Link>
          <Link to="/ointments" className="text-sm">Ointments</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm">Dashboard</Link>
              {user.role === 'admin' && <Link to="/admin" className="text-sm">Admin</Link>}
              <button onClick={logout} className="text-sm text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm">Login</Link>
              <Link to="/register" className="text-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
