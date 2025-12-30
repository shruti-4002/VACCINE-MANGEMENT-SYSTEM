import React from "react";
export default function AppointmentCard({appt, onCancel}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">{appt.vaccine?.name || "Vaccine"}</h3>
      <p>{appt.date} at {appt.time}</p>
      <p>By: {appt.user?.name || appt.user?.email}</p>
      <button className="mt-2 px-3 py-1 bg-red-500 text-white rounded" onClick={()=>onCancel(appt._id)}>Cancel</button>
    </div>
  );
}
