"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, X, Loader2, Key, FileText, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import html2canvas from "html2canvas";

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [availableSeats, setAvailableSeats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    fatherName: "",
    studentAddress: "",
    phone: "",
    seat: "",
    shift: "Morning",
    totalFee: "1000",
    paidAmount: "1000",
    feeMonth: "January",
    admissionDate: new Date().toISOString().split('T')[0],
    feeExpiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    paymentMode: "Cash"
  });

  // Bill Modal State
  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState<any>(null);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("https://sankalp-library.onrender.com/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSeats = async () => {
    try {
      const res = await axios.get("https://sankalp-library.onrender.com/api/seats");
      setAvailableSeats(res.data);
    } catch (err) {
      console.error("Failed to fetch seats", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchSeats();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editId) {
        await axios.put(`https://sankalp-library.onrender.com/api/students/${editId}`, formData);
      } else {
        await axios.post("https://sankalp-library.onrender.com/api/students", formData);
      }
      await fetchStudents();
      
      // Open Bill Modal instead of just closing
      setBillData({
        ...formData,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      });
      setIsModalOpen(false);
      setShowBillModal(true);
      
      setFormData({ studentId: "", fullName: "", fatherName: "", studentAddress: "", phone: "", seat: "", shift: "Morning", totalFee: "1000", paidAmount: "1000", feeMonth: "January", admissionDate: new Date().toISOString().split('T')[0], feeExpiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], paymentMode: "Cash" });
      setEditId(null);
    } catch (err) {
      console.error("Failed to save student", err);
      alert("Failed to save student. Ensure backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (student: any) => {
    setEditId(student._id);
    setFormData({
      studentId: student.studentId,
      fullName: student.fullName,
      fatherName: student.fatherName || "",
      studentAddress: student.studentAddress || "",
      phone: student.mobileNumber,
      seat: student.address || "",
      shift: student.shiftTiming || "Morning",
      totalFee: student.monthlyFee?.toString() || "1000",
      paidAmount: student.paidAmount?.toString() || "0",
      feeMonth: student.feeMonth || "January",
      admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      feeExpiryDate: student.feeExpiryDate ? new Date(student.feeExpiryDate).toISOString().split('T')[0] : new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      paymentMode: student.paymentMode || "Cash"
    });
    setIsModalOpen(true);
  };

  const handlePrintBill = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!billData) return;
    const dueAmount = Number(billData.totalFee) - Number(billData.paidAmount);
    const message = `*Sankalp Library - Admission Receipt* 📚\n\n*Name:* ${billData.fullName}\n*Student ID:* ${billData.studentId}\n*Date:* ${billData.date}\n\n*Seat:* ${billData.seat} (${billData.shift})\n*Fee Month:* ${billData.feeMonth}\n*Total Fee:* ₹${billData.totalFee}\n*Paid:* ₹${billData.paidAmount}\n*Due:* ₹${dueAmount}\n\nThank you for joining Sankalp Library!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/91${billData.phone}?text=${encodedMessage}`, "_blank");
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`https://sankalp-library.onrender.com/api/students/${id}`);
      await fetchStudents();
    } catch (err) {
      console.error(err);
      alert("Failed to delete student.");
    }
  };

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt("Enter new password for this student (min 6 chars):");
    if (!newPassword) return; // User cancelled
    if (newPassword.length < 6) return alert("Password must be at least 6 characters.");
    
    try {
      await axios.post(`https://sankalp-library.onrender.com/api/students/${id}/reset-password`, { newPassword });
      alert("Password reset successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to reset password.");
    }
  };

  const handleShowReceipt = (student: any) => {
    setBillData({
      _id: student._id,
      fullName: student.fullName,
      fatherName: student.fatherName || "",
      studentAddress: student.studentAddress || "",
      studentId: student.studentId,
      phone: student.mobileNumber,
      seat: student.address,
      shift: student.shiftTiming,
      totalFee: student.monthlyFee || 1000,
      paidAmount: student.paidAmount || 0,
      feeMonth: student.feeMonth || "January",
      admissionDate: student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A",
      feeExpiryDate: student.feeExpiryDate ? new Date(student.feeExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A",
      paymentMode: student.paymentMode || "Cash",
      date: new Date(student.createdAt || new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    });
    setShowBillModal(true);
  };

  const filteredStudents = students.filter(s => 
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Management</h2>
          <p className="text-slate-500 text-sm mt-1">View, search, and manage all registered students.</p>
        </div>
        <button 
          onClick={() => {
            setEditId(null);
            setFormData({ studentId: "", fullName: "", fatherName: "", studentAddress: "", phone: "", seat: "", shift: "Morning", totalFee: "1000", paidAmount: "1000", feeMonth: "January", admissionDate: new Date().toISOString().split('T')[0], feeExpiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], paymentMode: "Cash" });
            setIsModalOpen(true);
          }}
          className="bg-brand-blue hover:bg-brand-blue-light text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Student
        </button>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-brand-blue">{editId ? "Edit Student Details" : "Add New Student"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Student ID</label>
                    <input type="text" required value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="e.g. STU-001" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="John Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Father's Name</label>
                    <input type="text" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="Father's Name" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Address</label>
                    <input type="text" value={formData.studentAddress} onChange={(e) => setFormData({...formData, studentAddress: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="Student's Address" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Assigned Seat</label>
                    <input list="seat-options" type="text" required value={formData.seat} onChange={(e) => setFormData({...formData, seat: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="e.g. A-12" />
                    <datalist id="seat-options">
                      {availableSeats.map(seat => (
                        <option key={seat._id} value={seat.seatNumber} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Shift</label>
                    <input list="shift-options" type="text" value={formData.shift} onChange={(e) => setFormData({...formData, shift: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="Select or type time..." />
                    <datalist id="shift-options">
                      <option value="Morning" />
                      <option value="Evening" />
                      <option value="Full Day" />
                      <option value="Night" />
                      <option value="4 घंटा" />
                      <option value="6 घंटा" />
                      <option value="8 घंटा" />
                      <option value="10 घंटा" />
                      <option value="12 घंटा" />
                      <option value="14 घंटा" />
                      <option value="16 घंटा" />
                      <option value="18 घंटा" />
                      <option value="24 घंटा" />
                    </datalist>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Total Fee</label>
                    <input type="number" required value={formData.totalFee} onChange={(e) => setFormData({...formData, totalFee: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="1000" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Paid Amount</label>
                    <input type="number" required value={formData.paidAmount} onChange={(e) => setFormData({...formData, paidAmount: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" placeholder="1000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Fee Month</label>
                    <select value={formData.feeMonth} onChange={(e) => setFormData({...formData, feeMonth: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none">
                      <option>January</option>
                      <option>February</option>
                      <option>March</option>
                      <option>April</option>
                      <option>May</option>
                      <option>June</option>
                      <option>July</option>
                      <option>August</option>
                      <option>September</option>
                      <option>October</option>
                      <option>November</option>
                      <option>December</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Join Date</label>
                    <input type="date" value={formData.admissionDate} onChange={(e) => setFormData({...formData, admissionDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Validity (Expiry)</label>
                    <input type="date" value={formData.feeExpiryDate} onChange={(e) => setFormData({...formData, feeExpiryDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Payment Mode</label>
                    <select value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none">
                      <option>Cash</option>
                      <option>UPI</option>
                      <option>Bank Transfer</option>
                      <option>Monthly</option>
                      <option>Installment</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="bg-brand-gold hover:bg-brand-gold-light text-brand-blue font-bold px-6 py-2 rounded-lg transition-colors flex items-center shadow-md">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Student"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Bill Modal */}
      <AnimatePresence>
        {showBillModal && billData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:bg-white print:p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:w-full print:max-w-none print:rounded-none"
            >
              {/* Printable Area */}
              <div id="printable-bill" className="p-8 pb-4 print:w-[105mm] print:h-[148mm] print:p-3 print:mx-auto print:border print:border-dashed print:border-slate-300 print:overflow-hidden print:flex print:flex-col print:justify-between print:bg-white text-slate-800">
                <div className="text-center border-b-2 border-slate-800 pb-4 mb-6 print:pb-2 print:mb-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-brand-blue uppercase print:text-lg print:text-black">Sankalp Library</h1>
                  <p className="text-slate-600 mt-1 font-medium print:text-[10px] print:mt-0 print:text-black">पता- हाईस्कूल के नजदीक, आवापुर</p>
                  <p className="text-slate-600 font-semibold mb-2 print:text-[10px] print:mb-1 print:text-black">Mob: 8271925247</p>
                  <p className="text-slate-500 text-sm mt-1 print:text-[9px] print:mt-0 print:text-slate-600">Receipt No: #{Math.floor(10000 + Math.random() * 90000)} | Date: {billData.date}</p>
                </div>

                <div className="space-y-4 text-slate-800 text-sm sm:text-base print:space-y-1.5 print:text-[11px]">
                  <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                    <span className="font-semibold text-slate-600 print:text-slate-800">Student Name:</span>
                    <span className="font-bold print:text-black">{billData.fullName}</span>
                  </div>
                  {billData.fatherName && (
                    <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                      <span className="font-semibold text-slate-600 print:text-slate-800">Father's Name:</span>
                      <span className="font-bold print:text-black">{billData.fatherName}</span>
                    </div>
                  )}
                  {billData.studentAddress && (
                    <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                      <span className="font-semibold text-slate-600 print:text-slate-800">Address:</span>
                      <span className="font-bold print:text-black text-right max-w-[60%] truncate" title={billData.studentAddress}>{billData.studentAddress}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                    <span className="font-semibold text-slate-600 print:text-slate-800">Student ID:</span>
                    <span className="font-bold print:text-black">{billData.studentId}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                    <span className="font-semibold text-slate-600 print:text-slate-800">Mobile No:</span>
                    <span className="font-bold print:text-black">{billData.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                    <span className="font-semibold text-slate-600 print:text-slate-800">Seat & Shift:</span>
                    <span className="font-bold print:text-black">{billData.seat} ({billData.shift})</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                    <span className="font-semibold text-slate-600 print:text-slate-800">Date of Join:</span>
                    <span className="font-bold print:text-black">{billData.admissionDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                    <span className="font-semibold text-slate-600 print:text-slate-800">Validity:</span>
                    <span className="font-bold print:text-black">{billData.feeExpiryDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                    <span className="font-semibold text-slate-600 print:text-slate-800">Payment Mode:</span>
                    <span className="font-bold print:text-black">{billData.paymentMode}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                    <span className="font-semibold text-slate-600 print:text-slate-800">Fee Month:</span>
                    <span className="font-bold text-brand-blue print:text-black">{billData.feeMonth}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 print:pb-1">
                    <span className="font-semibold text-slate-600 print:text-slate-800">Total Fee:</span>
                    <span className="font-bold print:text-black">₹ {billData.totalFee}</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 text-green-700 print:pb-1 print:text-black">
                    <span className="font-semibold">Amount Paid:</span>
                    <span className="font-bold">₹ {billData.paidAmount}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-red-600 mb-4 print:mb-1 print:pt-0 print:text-black">
                    <span className="font-semibold">Due Amount:</span>
                    <span className="font-bold text-lg print:text-sm">₹ {Number(billData.totalFee) - Number(billData.paidAmount)}</span>
                  </div>

                  <div className="mt-8 pt-6 flex justify-between items-end text-sm text-slate-800 font-medium print:mt-4 print:pt-3 print:text-[10px]">
                    <div className="text-center">
                      <div className="w-28 border-b-2 border-slate-400 mb-1 print:w-20 print:border-black"></div>
                      Student's Sign.
                    </div>
                    <div className="text-center">
                      <div className="w-28 border-b-2 border-slate-400 mb-1 print:w-20 print:border-black"></div>
                      Authorised Signature
                    </div>
                  </div>

                  <div className="mt-6 text-center text-xs md:text-sm text-red-600 font-bold bg-red-50 p-2.5 rounded border border-red-100 print:mt-3 print:p-1.5 print:text-[9px] print:bg-white print:border-black print:text-black">
                    नोट - प्रत्येक माह में 5 दिन के अंदर पेमेंट करना अनिवार्य है।
                  </div>
                </div>

                <div className="mt-10 pt-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1 print:mt-2 print:pt-2 print:text-[8px] print:border-black print:text-black">
                  <p>Thank you for choosing Sankalp Library!</p>
                  <p className="font-semibold">Note: Fees once paid are strictly non-refundable.</p>
                </div>
              </div>

              {/* Action Buttons (Hidden in Print) */}
              <div className="p-4 sm:p-6 bg-slate-50 grid grid-cols-2 gap-3 print:hidden sticky bottom-0 border-t border-slate-200">
                <button onClick={() => setShowBillModal(false)} className="py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors col-span-1 flex items-center justify-center gap-2">
                  <X className="w-4 h-4" /> Close
                </button>
                <button 
                  onClick={() => {
                    const studentToEdit = students.find(s => s._id === billData._id);
                    if(studentToEdit) {
                      setShowBillModal(false);
                      handleEditClick(studentToEdit);
                    }
                  }} 
                  className="bg-brand-blue hover:bg-brand-blue-light text-white font-medium py-2.5 rounded-xl transition-colors shadow flex items-center justify-center gap-2 col-span-1"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button onClick={handleWhatsAppShare} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow flex items-center justify-center gap-2 col-span-1">
                  WhatsApp
                </button>
                <button onClick={() => window.print()} className="bg-brand-gold hover:bg-brand-gold-light text-brand-blue font-bold py-2.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 col-span-1">
                  <Printer className="w-5 h-5" /> Print
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print:hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by Name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex-1 sm:flex-none">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="px-6 py-4 font-semibold">Student ID</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Seat & Shift</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={student._id || student.studentId} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="text-brand-blue font-semibold text-sm bg-blue-50 px-2 py-1 rounded-md">{student.studentId}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{student.fullName}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{student.mobileNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800">{student.address}</div>
                      <div className="text-xs text-slate-500">{student.shiftTiming}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {student.status || 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 transition-opacity">
                        <button onClick={() => handleShowReceipt(student)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View Receipt">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleResetPassword(student._id)} className="p-2 text-brand-gold hover:bg-yellow-50 rounded-lg transition-colors" title="Reset Password">
                          <Key className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditClick(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteStudent(student._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button className="p-2 text-slate-400 group-hover:hidden">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No students found. Add one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm text-slate-500">
          <div>Showing {filteredStudents.length} entries</div>
          <div className="flex gap-1">
             <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
             <button className="px-3 py-1 border border-brand-blue bg-brand-blue text-white rounded-md">1</button>
             <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
