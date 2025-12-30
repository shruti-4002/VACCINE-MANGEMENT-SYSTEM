
import React, { useState } from 'react';
import API from '../utils/api';
import { toast } from 'react-toastify';
export default function ForgotPassword(){
  const [email,setEmail]=useState('');
  const submit=async(e)=>{ e.preventDefault(); try{ await API.post('/auth/forgot',{ email }); toast.success('If email exists, reset link sent'); }catch(err){ toast.error('Error sending reset'); } };
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow">
      <h3 className="text-xl font-semibold mb-3">Forgot password</h3>
      <form onSubmit={submit} className="space-y-3">
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" className="w-full p-3 rounded border" required />
        <button className="w-full p-3 bg-emerald-600 text-white rounded-lg">Send reset link</button>
      </form>
    </div>
  );
}
