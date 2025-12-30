import { useEffect, useState } from "react";
import API from "../api";   // ✅ FIX: Import API

export default function Ointments() {
  const [ointments, setOintments] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await API.get("/ointments");  // ✅ FIX: Use API not api
        setOintments(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ointments</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ointments.map((item) => (
          <div key={item._id} className="p-4 border rounded shadow-sm">
            <h3 className="font-bold">{item.name}</h3>
            <p>Qty: {item.stock}</p>
            <p>Expiry: —</p>
          </div>
        ))}
      </div>
    </div>
  );
}
