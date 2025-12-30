
import React, { useState } from 'react';
import API from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ResetPassword(){
  const { token } = useParams();
  const nav = useNavigate();
  const [password,setPassword]=useState('');
  const submit=async(e)=>{ e.preventDefault(); try{ await API.post(`/auth/reset/${token}`, { password }); toast.success('Password reset'); nav('/login'); }catch(err){ toast.error(err.response?.data?.message || 'Reset failed'); }};
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow">
      <h3 className="text-xl font-semibold mb-3">Reset password</h3>
      <form onSubmit={submit} className="space-y-3">
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" className="w-full p-3 rounded border" required />
        <button className="w-full p-3 bg-indigo-600 text-white rounded-lg">Reset password</button>
      </form>
    </div>
  );
}
