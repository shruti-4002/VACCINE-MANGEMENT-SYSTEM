// src/pages/ManageStock.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAdminStock, updateStock, createVaccine } from "../api";

export default function ManageStock() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState(0);
  const [newExpiry, setNewExpiry] = useState("");

  const load = async () => {
    try {
      const data = await getAdminStock();
      setList(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stock");
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (id) => {
    const qty = Number(editValue);
    if (isNaN(qty) || qty < 0) return toast.error("Enter a valid non-negative number");
    try {
      await updateStock(id, { quantity: qty });
      toast.success("Stock updated");
      setEditingId(null);
      setEditValue("");
      load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update stock");
    }
  };

  const incDec = (v, delta) => {
    const current = Number(v.quantity ?? 0);
    const next = Math.max(0, current + delta);
    setList(prev => prev.map(p => p._id === v._id ? { ...p, quantity: next } : p));
    updateStock(v._id, { quantity: next }).catch(err => {
      console.error(err);
      toast.error("Update failed");
      load();
    });
  };

  const startEdit = (v) => {
    setEditingId(v._id);
    setEditValue(String(v.quantity ?? 0));
  };

  const submitNew = async () => {
    if (!newName.trim()) return toast.error("Name required");
    try {
      const payload = { name: newName.trim(), quantity: Number(newQty) || 0, expiry: newExpiry || undefined };
      await createVaccine(payload);
      toast.success("Vaccine added");
      setShowAdd(false);
      setNewName(""); setNewQty(0); setNewExpiry("");
      load();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to add vaccine");
    }
  };

  const filtered = list.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Stock Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + Add Vaccine
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search vaccine..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      <div className="space-y-4">
        {filtered.map(v => (
          <div key={v._id} className="bg-white rounded-xl p-4 flex items-center justify-between border border-gray-100 shadow-sm">
            <div>
              <div className="text-lg font-medium text-gray-900">{v.name}</div>
              <div className="text-sm text-gray-500 mt-1">Stock: <span className="font-semibold text-gray-700">{v.quantity}</span></div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => incDec(v, -10)} className="w-11 h-11 rounded-full bg-white border hover:bg-red-50 text-red-600">−10</button>
                <button onClick={() => incDec(v, -1)} className="w-11 h-11 rounded-full bg-white border hover:bg-red-50 text-red-600">−1</button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => incDec(v, +1)} className="w-11 h-11 rounded-full bg-white border hover:bg-green-50 text-green-600">+1</button>
                <button onClick={() => incDec(v, +10)} className="w-11 h-11 rounded-full bg-white border hover:bg-green-50 text-green-600">+10</button>
              </div>

              {editingId === v._id ? (
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-28 px-3 py-2 border rounded-md" />
                  <button onClick={() => save(v._id)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
                  <button onClick={() => { setEditingId(null); setEditValue(""); }} className="px-3 py-2 bg-gray-100 rounded-md">Cancel</button>
                </div>
              ) : (
                <button onClick={() => startEdit(v)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Edit</button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && <div className="text-center text-gray-500 py-8">No vaccines found.</div>}
      </div>

      {/* Add vaccine modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add Vaccine</h2>

            <div className="space-y-3">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Vaccine name" className="w-full p-3 border rounded" />
              <input value={newQty} onChange={(e) => setNewQty(e.target.value)} type="number" min="0" placeholder="Quantity" className="w-full p-3 border rounded" />
              <label className="block text-sm text-gray-600">Expiry (optional)</label>
              <input value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} type="date" className="w-full p-3 border rounded" />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={submitNew} className="px-4 py-2 bg-green-600 text-white rounded">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
