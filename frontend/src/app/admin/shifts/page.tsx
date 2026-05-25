"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Plus, Snowflake, Wind, Trash2, Edit, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "AC",
    timeRange: "",
    durationText: "",
    price: "",
    colorCode: "#1e3a8a" // Default blue-800
  });
  const [isSaving, setIsSaving] = useState(false);

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

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ category: "AC", timeRange: "", durationText: "", price: "", colorCode: "#1e3a8a" });
    setIsModalOpen(true);
  };

  const openEditModal = (shift: any) => {
    setEditingId(shift._id);
    setFormData({
      category: shift.category,
      timeRange: shift.timeRange,
      durationText: shift.durationText,
      price: shift.price.toString(),
      colorCode: shift.colorCode || "#1e3a8a"
    });
    setIsModalOpen(true);
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await axios.put(`https://sankalp-library.onrender.com/api/shifts/${editingId}`, formData);
      } else {
        await axios.post("https://sankalp-library.onrender.com/api/shifts", formData);
      }
      setIsModalOpen(false);
      fetchShifts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;
  }

  const acShifts = shifts.filter(s => s.category === "AC");
  const nonAcShifts = shifts.filter(s => s.category === "Non-AC");

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Shift Management</h2>
          <p className="text-slate-500 text-sm">Manage shift timings and pricing</p>
        </div>
        <div className="flex gap-3">
          {shifts.length === 0 && (
            <button onClick={handleSeed} disabled={isSeeding} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2">
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Load Default Shifts
            </button>
          )}
          <button onClick={openAddModal} className="bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all">
            <Plus className="w-5 h-5" />
            Add Shift
          </button>
        </div>
      </div>

      {shifts.length === 0 && !isSeeding ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <p className="text-slate-500 mb-4">No shifts configured yet.</p>
          <button onClick={handleSeed} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold mr-3">Load Default Catalog</button>
          <button onClick={openAddModal} className="bg-brand-blue text-white px-6 py-2 rounded-xl font-bold">Add Custom Shift</button>
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
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 mr-2">: ₹{shift.price}/-</span>
                    <button onClick={() => openEditModal(shift)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(shift._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {acShifts.length === 0 && <p className="text-center text-sm text-slate-400 py-4">No AC shifts added.</p>}
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
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 mr-2">: ₹{shift.price}/-</span>
                    <button onClick={() => openEditModal(shift)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(shift._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {nonAcShifts.length === 0 && <p className="text-center text-sm text-slate-400 py-4">No Non-AC shifts added.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
              <div className="flex justify-between items-center p-5 border-b border-slate-100">
                <h3 className="font-bold text-xl text-slate-800">{editingId ? "Edit Shift" : "Add New Shift"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSaveShift} className="p-6 space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Category</label>
                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue bg-white text-slate-800">
                      <option value="AC">AC</option>
                      <option value="Non-AC">Non-AC</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Text Color Code</label>
                    <input type="color" required value={formData.colorCode} onChange={(e) => setFormData({...formData, colorCode: e.target.value})} className="w-full h-12 px-2 py-1 border border-slate-200 rounded-xl outline-none cursor-pointer" title="Choose color for shift text" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Time Range</label>
                  <input type="text" required value={formData.timeRange} onChange={(e) => setFormData({...formData, timeRange: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-slate-800" placeholder="e.g. 06:00 AM to 10:00 PM" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Duration Text</label>
                    <input type="text" required value={formData.durationText} onChange={(e) => setFormData({...formData, durationText: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-slate-800" placeholder="e.g. (16 Hours)" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Price (₹)</label>
                    <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue text-slate-800" placeholder="e.g. 1500" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold flex justify-center items-center shadow-md">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? "Save Changes" : "Add Shift")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
