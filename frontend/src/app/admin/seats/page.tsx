"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, User, Loader2, X, Trash2, Armchair, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function SeatsPage() {
  const [seats, setSeats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSeat, setNewSeat] = useState({ seatNumber: "", floorNumber: 1, seatType: "Normal" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editSeatId, setEditSeatId] = useState<string | null>(null);

  const fetchSeats = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("https://sankalp-library.onrender.com/api/seats");
      setSeats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const handleAddSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editSeatId) {
        await axios.put(`https://sankalp-library.onrender.com/api/seats/${editSeatId}`, newSeat);
      } else {
        await axios.post("https://sankalp-library.onrender.com/api/seats", newSeat);
      }
      await fetchSeats();
      setIsModalOpen(false);
      setNewSeat({ seatNumber: "", floorNumber: 1, seatType: "Normal" });
      setEditSeatId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save seat. Seat number might already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeat = async (id: string) => {
    if (!confirm("Are you sure you want to delete this seat?")) return;
    try {
      await axios.delete(`https://sankalp-library.onrender.com/api/seats/${id}`);
      await fetchSeats();
    } catch (err) {
      console.error(err);
    }
  };

  const floors = Array.from(new Set(seats.map(s => s.floorNumber))).sort((a,b) => a - b);

  const openEditModal = (seat: any) => {
    setEditSeatId(seat._id);
    setNewSeat({ seatNumber: seat.seatNumber, floorNumber: seat.floorNumber, seatType: seat.seatType });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Seat Management</h2>
          <p className="text-slate-500 text-sm mt-1">Live visual representation of all library seats.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-4 text-sm font-medium bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Occupied</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></div><span>Empty</span></div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-brand-blue hover:bg-brand-blue-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center shadow-md">
            <Plus className="w-5 h-5 mr-2" /> Add Seat
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-brand-blue">{editSeatId ? "Edit Seat" : "Add New Seat"}</h3>
                <button onClick={() => { setIsModalOpen(false); setEditSeatId(null); setNewSeat({ seatNumber: "", floorNumber: 1, seatType: "Normal" }); }} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddSeat} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Seat Number</label>
                  <input type="text" required value={newSeat.seatNumber} onChange={(e) => setNewSeat({...newSeat, seatNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="e.g. A-1" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Room Number</label>
                  <input type="number" required min="1" value={newSeat.floorNumber} onChange={(e) => setNewSeat({...newSeat, floorNumber: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Type</label>
                  <select value={newSeat.seatType} onChange={(e) => setNewSeat({...newSeat, seatType: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold outline-none">
                    <option>Normal</option>
                    <option>Cabin</option>
                    <option>AC</option>
                  </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-blue font-bold py-2 rounded-lg transition-colors flex items-center justify-center">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Seat"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
        ) : seats.length === 0 ? (
           <div className="bg-white p-10 rounded-2xl text-center border border-slate-100">
             <p className="text-slate-500">No seats created yet. Click "Add Seat" to begin.</p>
           </div>
        ) : (
          floors.map((floor) => (
            <div key={floor} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-brand-blue">{floor}</span>
                Room Number {floor}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {seats.filter(s => s.floorNumber === floor).map((seat, index) => {
                  const isOccupied = seat.status === 'Occupied';
                  return (
                    <motion.div 
                      key={seat._id}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      transition={{ delay: index * 0.02, type: "spring", stiffness: 200 }}
                      className={`relative group p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300
                        ${isOccupied 
                          ? 'bg-gradient-to-b from-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-1' 
                          : 'bg-gradient-to-b from-slate-50 to-white text-slate-600 border-slate-200 hover:border-brand-gold hover:shadow-xl hover:-translate-y-1'
                        }
                      `}
                    >
                      <div className={`p-3 rounded-full ${isOccupied ? 'bg-white/20 shadow-inner' : 'bg-slate-100 shadow-sm'}`}>
                        <Armchair className={`w-8 h-8 ${isOccupied ? 'text-white' : 'text-slate-400 group-hover:text-brand-gold transition-colors'}`} />
                      </div>
                      
                      <div className="text-center">
                        <span className="font-extrabold text-lg tracking-tight block">{seat.seatNumber}</span>
                        {isOccupied && seat.assignedTo && (
                           <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full mt-1 block truncate max-w-[100px]" title={seat.assignedTo.fullName}>
                             {seat.assignedTo.fullName.split(' ')[0]}
                           </span>
                        )}
                        {!isOccupied && (
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-1">Available</span>
                        )}
                      </div>

                      <div className="text-[10px] font-medium opacity-80 flex items-center gap-1 mt-1 bg-black/5 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                         {isOccupied ? <User className="w-3 h-3 text-white" /> : <CheckCircle2 className="w-3 h-3 text-slate-400" />}
                         {seat.seatType}
                      </div>
                      
                      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(seat); }} className="bg-blue-500 text-white rounded-full p-1.5 hover:scale-110 shadow-md">
                           <Edit className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteSeat(seat._id); }} className="bg-red-500 text-white rounded-full p-1.5 hover:scale-110 shadow-md">
                           <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
