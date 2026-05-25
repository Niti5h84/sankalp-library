"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Plus, Snowflake, Wind, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchShifts = async () => {
    try {
      const res = await axios.get("https://sankalp-library.onrender.com/api/shifts");
      setShifts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await axios.post("https://sankalp-library.onrender.com/api/shifts/seed");
      await fetchShifts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shift?")) return;
    try {
      await axios.delete(`https://sankalp-library.onrender.com/api/shifts/${id}`);
      fetchShifts();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;
  }

  const acShifts = shifts.filter(s => s.category === "AC");
  const nonAcShifts = shifts.filter(s => s.category === "Non-AC");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Shift Management</h2>
          <p className="text-slate-500 text-sm">Manage shift timings and pricing</p>
        </div>
        {shifts.length === 0 && (
          <button onClick={handleSeed} disabled={isSeeding} className="bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2">
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Load Default Shifts
          </button>
        )}
      </div>

      {shifts.length === 0 && !isSeeding ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <p className="text-slate-500 mb-4">No shifts configured yet.</p>
          <button onClick={handleSeed} className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold">Load Default Shift Catalog</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* AC Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-yellow-400 py-3 text-center border-b border-yellow-500/20">
              <h3 className="font-bold text-slate-900 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <Snowflake className="w-4 h-4 text-slate-900" />
                AC
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {acShifts.map((shift, idx) => (
                <div key={shift._id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand-blue/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="font-bold w-6 text-center text-slate-400">{idx + 1}.</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: shift.colorCode }}>{shift.timeRange}</p>
                      <p className="text-xs font-semibold text-slate-500">{shift.durationText}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-slate-800">: ₹{shift.price}/-</span>
                    <button onClick={() => handleDelete(shift._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Non-AC Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-yellow-400 py-3 text-center border-b border-yellow-500/20">
              <h3 className="font-bold text-slate-900 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <Wind className="w-4 h-4 text-slate-900" />
                Non-AC
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {nonAcShifts.map((shift, idx) => (
                <div key={shift._id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand-blue/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <span className="font-bold w-6 text-center text-slate-400">{idx + 1}.</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: shift.colorCode }}>{shift.timeRange}</p>
                      <p className="text-xs font-semibold text-slate-500">{shift.durationText}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-slate-800">: ₹{shift.price}/-</span>
                    <button onClick={() => handleDelete(shift._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
