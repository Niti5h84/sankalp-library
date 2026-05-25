"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Search, Printer, MessageCircle, Edit, X, User, Calendar, MapPin, Phone, CreditCard, Clock, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInMonths, differenceInDays } from "date-fns";

export default function ReportsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("https://sankalp-library.onrender.com/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(search.toLowerCase()) || 
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.mobileNumber.includes(search)
  );

  const openReportCard = (student: any) => {
    setSelectedStudent(student);
    setIsEditing(false);
  };

  const calculateDuration = (admissionDate: string) => {
    if (!admissionDate) return "N/A";
    const start = new Date(admissionDate);
    const end = new Date();
    const months = differenceInMonths(end, start);
    const days = differenceInDays(end, start) % 30; // approximate days remaining
    if (months === 0) return `${days} Days`;
    return `${months} Months, ${days} Days`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!selectedStudent) return;
    const msg = `Hello ${selectedStudent.fullName},\n\nHere is your Sankalp Library Report Card update:\n\n*Room Number:* ${selectedStudent.studentId}\n*Joined:* ${format(new Date(selectedStudent.admissionDate), "dd MMM yyyy")}\n*Total Duration:* ${calculateDuration(selectedStudent.admissionDate)}\n*Current Fee Month:* ${selectedStudent.feeMonth || 'N/A'}\n*Fee Expiry:* ${selectedStudent.feeExpiryDate ? format(new Date(selectedStudent.feeExpiryDate), "dd MMM yyyy") : 'N/A'}\n*Paid Amount:* ₹${selectedStudent.paidAmount}/-\n*Payment Mode:* ${selectedStudent.paymentMode}\n\nRegards,\n*Sankalp Library & Roy Online World*`;
    const url = `https://wa.me/91${selectedStudent.mobileNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const startEditing = () => {
    setEditData({
      fullName: selectedStudent.fullName,
      fatherName: selectedStudent.fatherName,
      mobileNumber: selectedStudent.mobileNumber,
      totalFee: selectedStudent.monthlyFee,
      paidAmount: selectedStudent.paidAmount,
      paymentMode: selectedStudent.paymentMode,
      feeExpiryDate: selectedStudent.feeExpiryDate ? new Date(selectedStudent.feeExpiryDate).toISOString().split('T')[0] : ""
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const res = await axios.put(`https://sankalp-library.onrender.com/api/students/${selectedStudent._id}`, editData);
      setSelectedStudent(res.data);
      // Update local state
      setStudents(students.map(s => s._id === res.data._id ? res.data : s));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update student.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>;
  }

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Report Cards</h2>
          <p className="text-slate-500 text-sm">View full analytics, fee status, and print report cards</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print:hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name, ID or mobile..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-brand-blue"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500">
                <th className="p-4 font-semibold">Student</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Seat</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, idx) => (
                <tr key={s._id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                      {s.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{s.fullName}</p>
                      <p className="text-xs text-slate-500">{s.studentId}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{s.mobileNumber}</td>
                  <td className="p-4 text-sm font-semibold text-brand-blue">{s.address || 'N/A'}</td>
                  <td className="p-4 text-sm text-slate-600">{format(new Date(s.admissionDate), "dd MMM yyyy")}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openReportCard(s)} className="px-4 py-2 bg-brand-gold text-brand-blue font-bold text-xs rounded-lg shadow-sm hover:scale-105 transition-transform flex items-center gap-1 inline-flex">
                      <FileText className="w-3 h-3" />
                      View Card
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT CARD MODAL */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:absolute print:inset-0 print:bg-white print:p-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[90vh] relative print:shadow-none print:w-full print:max-w-none print:max-h-none print:h-auto"
              id="printable-report-card"
            >
              {/* Modal Header - Hidden in Print */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 print:hidden sticky top-0 bg-white z-10">
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                  <FileText className="text-brand-blue w-6 h-6" />
                  Student Report Card
                </h3>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <>
                      <button onClick={startEditing} className="p-2 bg-blue-50 text-brand-blue hover:bg-blue-100 rounded-xl transition-colors tooltip" title="Edit Data"><Edit className="w-5 h-5" /></button>
                      <button onClick={handleWhatsApp} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors tooltip" title="Send WhatsApp"><MessageCircle className="w-5 h-5" /></button>
                      <button onClick={handlePrint} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors tooltip" title="Print Card"><Printer className="w-5 h-5" /></button>
                    </>
                  )}
                  <button onClick={() => setSelectedStudent(null)} className="p-2 bg-slate-100 text-red-500 hover:bg-red-100 rounded-xl transition-colors ml-2"><X className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Printable Content Area */}
              <div className="p-8 print:p-0 print:w-full print:block">
                {/* Print Header */}
                <div className="text-center mb-8 pb-6 border-b-2 border-brand-blue/20 print:border-brand-blue print:mb-4">
                  <h1 className="text-3xl font-extrabold text-brand-blue print:text-black tracking-tight mb-2">SANKALP LIBRARY</h1>
                  <h2 className="text-lg font-bold text-brand-gold print:text-gray-600 uppercase tracking-widest">& Roy Online World</h2>
                  <p className="text-sm font-semibold text-slate-500 mt-2">STUDENT REPORT CARD</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 print:grid-cols-2">
                  {/* Left Column: Personal Details */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 print:border-none print:bg-transparent print:p-0 print:space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 print:text-black print:text-lg print:border-b print:pb-1">
                        <User className="w-4 h-4" /> Personal Details
                      </h4>
                      
                      {!isEditing ? (
                        <div className="space-y-4">
                          <div><p className="text-xs text-slate-500 uppercase">Student Name</p><p className="font-bold text-lg text-slate-800">{selectedStudent.fullName}</p></div>
                          <div><p className="text-xs text-slate-500 uppercase">Room Number</p><p className="font-bold text-brand-blue">{selectedStudent.studentId}</p></div>
                          <div><p className="text-xs text-slate-500 uppercase">Father's Name</p><p className="font-semibold text-slate-700">{selectedStudent.fatherName || 'N/A'}</p></div>
                          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><p className="font-semibold text-slate-700">{selectedStudent.mobileNumber}</p></div>
                        </div>
                      ) : (
                        <div className="space-y-3 print:hidden">
                          <div>
                            <label className="text-xs text-slate-500 uppercase">Full Name</label>
                            <input type="text" value={editData.fullName} onChange={e => setEditData({...editData, fullName: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 uppercase">Father's Name</label>
                            <input type="text" value={editData.fatherName} onChange={e => setEditData({...editData, fatherName: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 uppercase">Mobile Number</label>
                            <input type="text" value={editData.mobileNumber} onChange={e => setEditData({...editData, mobileNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 print:border-none print:bg-transparent print:p-0 print:space-y-4">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2 print:text-black print:text-lg print:border-b print:pb-1">
                        <MapPin className="w-4 h-4" /> Allocation
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-xs text-slate-500 uppercase">Seat Number</p><p className="font-bold text-xl text-brand-blue">{selectedStudent.address || 'N/A'}</p></div>
                        <div><p className="text-xs text-slate-500 uppercase">Shift Timing</p><p className="font-bold text-sm text-slate-800">{selectedStudent.shiftTiming || 'N/A'}</p></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Attendance & Fees */}
                  <div className="space-y-6">
                    <div className="bg-brand-gold/10 p-5 rounded-2xl border border-brand-gold/20 print:border-none print:bg-transparent print:p-0 print:space-y-4">
                      <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2 print:text-black print:text-lg print:border-b print:pb-1">
                        <Calendar className="w-4 h-4" /> Attendance Duration
                      </h4>
                      <div className="space-y-4">
                        <div><p className="text-xs text-slate-500 uppercase">Date of Admission</p><p className="font-bold text-slate-800">{format(new Date(selectedStudent.admissionDate), "dd MMMM yyyy")}</p></div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">Total Time Attended</p>
                          <div className="inline-block mt-1 px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200">
                            {calculateDuration(selectedStudent.admissionDate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-5 rounded-2xl border border-green-100 print:border-none print:bg-transparent print:p-0 print:space-y-4">
                      <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-4 flex items-center gap-2 print:text-black print:text-lg print:border-b print:pb-1">
                        <CreditCard className="w-4 h-4" /> Current Fee Status
                      </h4>
                      {!isEditing ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs text-slate-500 uppercase">Monthly Fee</p><p className="font-bold text-slate-800">₹{selectedStudent.monthlyFee}/-</p></div>
                            <div><p className="text-xs text-slate-500 uppercase">Amount Paid</p><p className="font-bold text-green-600">₹{selectedStudent.paidAmount}/-</p></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs text-slate-500 uppercase">Payment Mode</p><p className="font-semibold text-slate-700">{selectedStudent.paymentMode}</p></div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Fee Expiry Date</p>
                              <p className={`font-bold ${new Date(selectedStudent.feeExpiryDate) < new Date() ? 'text-red-500' : 'text-slate-800'}`}>
                                {selectedStudent.feeExpiryDate ? format(new Date(selectedStudent.feeExpiryDate), "dd MMM yyyy") : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 print:hidden">
                           <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-500 uppercase">Monthly Fee</label>
                              <input type="number" value={editData.totalFee} onChange={e => setEditData({...editData, totalFee: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 uppercase">Paid Amount</label>
                              <input type="number" value={editData.paidAmount} onChange={e => setEditData({...editData, paidAmount: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-500 uppercase">Payment Mode</label>
                              <select value={editData.paymentMode} onChange={e => setEditData({...editData, paymentMode: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                <option>Cash</option>
                                <option>Online</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 uppercase">Expiry Date</label>
                              <input type="date" value={editData.feeExpiryDate} onChange={e => setEditData({...editData, feeExpiryDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8 flex gap-3 print:hidden">
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
                    <button onClick={handleSaveEdit} disabled={isSaving} className="flex-1 py-3 bg-brand-blue rounded-xl font-bold text-white hover:bg-brand-blue/90 flex justify-center items-center">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                    </button>
                  </div>
                )}

                {/* Print Footer */}
                <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 hidden print:block">
                  <p>This is a system generated report card from Sankalp Library & Roy Online World.</p>
                  <p>Generated on {format(new Date(), "dd MMMM yyyy 'at' hh:mm a")}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
