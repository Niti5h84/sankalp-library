"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, IndianRupee, MessageCircle, AlertTriangle, CheckCircle2, ChevronRight, CheckSquare, Square } from "lucide-react";
import axios from "axios";

export default function FeesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Fast Queue State
  const [queueActive, setQueueActive] = useState(false);
  const [queueIndex, setQueueIndex] = useState(0);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRenew = async (id: string) => {
    if (!confirm("Confirm renewal for 30 days?")) return;
    try {
      await axios.post(`http://localhost:5000/api/students/${id}/renew`);
      await fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to renew");
    }
  };

  const getStatusInfo = (expiryDate?: string) => {
    if (!expiryDate) return { text: "Pending", color: "text-red-600", bg: "bg-red-50", warning: true };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Expired", color: "text-red-600", bg: "bg-red-50", warning: true };
    if (diffDays <= 5) return { text: `Expiring in ${diffDays}d`, color: "text-brand-gold", bg: "bg-brand-gold/10", warning: true };
    return { text: "Active", color: "text-green-600", bg: "bg-green-50", warning: false };
  };

  const filteredStudents = students.filter(s => 
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.mobileNumber?.includes(searchTerm)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) setSelectedIds([]);
    else setSelectedIds(filteredStudents.map(s => s._id));
  };

  const sendWhatsApp = (student: any) => {
    const message = encodeURIComponent(`Hello ${student.fullName},\n\nYour library subscription at Sankalp Library is expiring/pending. Please renew your subscription to keep your seat reserved.\n\nThank you!`);
    const phone = student.mobileNumber.replace(/\D/g, '');
    const url = `https://wa.me/91${phone}?text=${message}`;
    window.open(url, "_blank");
  };

  // Queue Handlers
  const startQueue = () => {
    if (selectedIds.length === 0) return alert("Select at least one student!");
    setQueueActive(true);
    setQueueIndex(0);
    // Auto open the first one
    const firstStudent = students.find(s => s._id === selectedIds[0]);
    if (firstStudent) sendWhatsApp(firstStudent);
  };

  const nextInQueue = () => {
    const nextIdx = queueIndex + 1;
    if (nextIdx >= selectedIds.length) {
      setQueueActive(false);
      setSelectedIds([]);
      alert("All selected messages sent!");
      return;
    }
    setQueueIndex(nextIdx);
    const nextStudent = students.find(s => s._id === selectedIds[nextIdx]);
    if (nextStudent) sendWhatsApp(nextStudent);
  };

  const cancelQueue = () => {
    setQueueActive(false);
    setQueueIndex(0);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fees & Renewals</h2>
          <p className="text-slate-500 text-sm mt-1">Track expiring subscriptions and send WhatsApp alerts.</p>
        </div>
        
        {/* Bulk Actions */}
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && !queueActive && (
             <button onClick={startQueue} className="bg-[#25D366] hover:bg-[#1ebd5c] text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center shadow-md">
               <MessageCircle className="w-5 h-5 mr-2" /> Send to Selected ({selectedIds.length})
             </button>
          )}
        </div>
      </div>

      {/* Queue Active Banner */}
      {queueActive && (
        <div className="bg-slate-800 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl sticky top-4 z-50 animate-bounce-short">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
             </div>
             <div>
                <p className="font-bold">Fast Queue Active</p>
                <p className="text-sm text-slate-300">Sending {queueIndex + 1} of {selectedIds.length}</p>
             </div>
          </div>
          <div className="flex gap-3">
             <button onClick={cancelQueue} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors">Cancel</button>
             <button onClick={nextInQueue} className="px-6 py-2 bg-[#25D366] hover:bg-[#1ebd5c] text-slate-900 rounded-xl text-sm font-bold transition-colors flex items-center">
               Send Next <ChevronRight className="w-4 h-4 ml-1" />
             </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by Name or Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="px-6 py-4 w-12 cursor-pointer" onClick={toggleSelectAll}>
                    {selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? <CheckSquare className="w-5 h-5 text-brand-blue" /> : <Square className="w-5 h-5 text-slate-300" />}
                  </th>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Seat</th>
                  <th className="px-6 py-4 font-semibold">Expiry Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const statusInfo = getStatusInfo(student.feeExpiryDate);
                  const isSelected = selectedIds.includes(student._id);

                  return (
                    <motion.tr 
                      key={student._id}
                      className={`hover:bg-slate-50/80 transition-colors group ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="px-6 py-4" onClick={() => toggleSelect(student._id)}>
                        {isSelected ? <CheckSquare className="w-5 h-5 text-brand-blue" /> : <Square className="w-5 h-5 text-slate-300" />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{student.fullName}</div>
                        <div className="text-xs text-slate-500">{student.mobileNumber}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{student.address || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.feeExpiryDate ? new Date(student.feeExpiryDate).toLocaleDateString() : 'Not Set'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.warning && <AlertTriangle className="w-3 h-3" />}
                          {!statusInfo.warning && <CheckCircle2 className="w-3 h-3" />}
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => sendWhatsApp(student)} className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-lg transition-colors" title="Send WhatsApp">
                             <MessageCircle className="w-5 h-5" />
                           </button>
                           <button onClick={() => handleRenew(student._id)} className="px-3 py-2 bg-brand-blue/10 text-brand-blue font-bold hover:bg-brand-blue hover:text-white text-xs rounded-lg transition-colors">
                             Renew (30d)
                           </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {filteredStudents.length === 0 && !isLoading && (
            <div className="text-center py-12 text-slate-500">No students found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
