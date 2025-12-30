
import React, { useState, useEffect } from 'react';
import API from '../utils/api';

export default function AdminPanel(){
  const [vacs,setVacs]=useState([]);
  const [form,setForm]=useState({name:'',quantity:0});
  useEffect(()=>{ API.get('/vaccines').then(r=>setVacs(r.data)).catch(()=>{}); },[]);
  const add=async()=>{ await API.post('/vaccines', form); const r=await API.get('/vaccines'); setVacs(r.data); };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-semibold">Add Vaccine</h3>
        <input className="border p-2 mr-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input className="border p-2 mr-2" placeholder="Quantity" type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:Number(e.target.value)})} />
        <button onClick={add} className="px-3 py-2 bg-sky-600 text-white rounded">Add</button>
      </div>

      <div className="mt-6">
        <h3 className="text-xl">Existing Vaccines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {vacs.map(v=> (
            <div key={v._id} className="p-3 bg-white rounded shadow"> <strong>{v.name}</strong><p>Qty {v.quantity}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
