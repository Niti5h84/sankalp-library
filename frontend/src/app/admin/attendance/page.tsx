"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, X, Circle, Loader2 } from "lucide-react";
import axios from "axios";

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceModal, setAttendanceModal] = useState<{isOpen: boolean, student: any, day: number, dateStr: string} | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("https://sankalp-library.onrender.com/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await axios.get(`https://sankalp-library.onrender.com/api/attendance?month=${month}&year=${year}`);
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setIsLoading(true);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setIsLoading(true);
  };

  const markAttendance = async (studentId: string, day: number, status: string) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const correctDateStr = new Date(targetDate.getTime() - (targetDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    try {
      await axios.post("https://sankalp-library.onrender.com/api/attendance", {
        studentId,
        date: correctDateStr,
        status
      });
      // Refresh attendance
      fetchAttendance();
      setAttendanceModal(null);
    } catch (err) {
      console.error("Failed to mark attendance", err);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-blue" /> Attendance Calendar
          </h2>
          <p className="text-slate-500 text-sm mt-1">Mark daily attendance for all active students.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
          <div className="flex gap-2">
            <select 
              value={currentDate.getMonth()} 
              onChange={(e) => { setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1)); setIsLoading(true); }}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer hover:bg-slate-200/50 px-2 py-1 rounded appearance-none"
            >
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select 
              value={currentDate.getFullYear()} 
              onChange={(e) => { setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1)); setIsLoading(true); }}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer hover:bg-slate-200/50 px-2 py-1 rounded appearance-none"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-bold rounded-tl-xl sticky left-0 bg-slate-50 z-30 w-64 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Student Name</th>
                  <th className="px-3 py-4 font-bold text-center bg-slate-50 sticky left-[256px] z-30 border-r border-slate-200 text-green-600" title="Total Present">P</th>
                  <th className="px-3 py-4 font-bold text-center bg-slate-50 sticky left-[304px] z-30 border-r border-slate-200 text-red-600" title="Total Absent">A</th>
                  <th className="px-3 py-4 font-bold text-center bg-slate-50 sticky left-[352px] z-30 border-r border-slate-200 text-brand-gold" title="Total Leave">L</th>
                  {daysArray.map(day => (
                    <th key={day} className="px-2 py-4 font-bold text-center min-w-[40px] border-b border-slate-200">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const studentRecords = attendance.filter(a => a.student?._id === student._id);
                  const pCount = studentRecords.filter(a => a.status === 'Present').length;
                  const aCount = studentRecords.filter(a => a.status === 'Absent').length;
                  const lCount = studentRecords.filter(a => a.status === 'Leave').length;

                  return (
                  <tr key={student._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-medium text-slate-800 sticky left-0 bg-white border-r border-slate-100 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="whitespace-nowrap">{student.fullName}</div>
                      <div className="text-xs text-slate-400 font-normal">Room: {student.studentId}</div>
                    </td>
                    <td className="px-3 py-3 font-bold text-center sticky left-[256px] bg-green-50/50 border-r border-slate-100 z-20 text-green-700">{pCount}</td>
                    <td className="px-3 py-3 font-bold text-center sticky left-[304px] bg-red-50/50 border-r border-slate-100 z-20 text-red-700">{aCount}</td>
                    <td className="px-3 py-3 font-bold text-center sticky left-[352px] bg-amber-50/50 border-r border-slate-100 z-20 text-brand-gold">{lCount}</td>
                    {daysArray.map(day => {
                      const targetDate = new Date(year, currentDate.getMonth(), day);
                      const targetDateStr = new Date(targetDate.getTime() - (targetDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                      
                      const todayDate = new Date();
                      todayDate.setHours(0,0,0,0);
                      const isPastDate = targetDate < todayDate;

                      const record = attendance.find(a => 
                        a.student?._id === student._id && 
                        a.date.startsWith(targetDateStr)
                      );
                      
                      let cellContent = <Circle className="w-4 h-4 text-slate-200" />;
                      
                      if (isPastDate && !record) {
                        cellContent = <div className="w-2.5 h-2.5 rounded-full bg-slate-800" title="Locked (Past Date)"></div>;
                      }

                      if (record) {
                        if (record.status === 'Present') cellContent = <Check className="w-4 h-4 text-green-500" />;
                        else if (record.status === 'Absent') cellContent = <X className="w-4 h-4 text-red-500" />;
                        else if (record.status === 'Leave') cellContent = <span className="text-brand-gold font-bold text-xs">L</span>;
                      }

                      return (
                        <td key={day} className={`px-1 py-3 text-center border-r border-slate-50 last:border-0 relative ${isPastDate ? 'cursor-not-allowed opacity-80 bg-slate-50/50' : 'group cursor-pointer'}`}
                            onClick={() => {
                              if (isPastDate) return; // Prevent filling back dates
                              if (record) return; // Prevent changing after marked
                              
                              setAttendanceModal({
                                isOpen: true,
                                student: student,
                                day: day,
                                dateStr: targetDateStr
                              });
                            }}
                        >
                          <div className={`flex justify-center items-center w-8 h-8 rounded-lg mx-auto ${!isPastDate ? 'group-hover:bg-slate-100 transition-colors' : ''}`}>
                             {cellContent}
                          </div>
                        </td>
                      );
                    })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {students.length === 0 && (
              <div className="p-10 text-center text-slate-500">No students found. Add students first to mark attendance.</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 px-4">
         <div className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500" /> Present</div>
         <div className="flex items-center gap-2 text-sm text-slate-600"><X className="w-4 h-4 text-red-500" /> Absent</div>
         <div className="flex items-center gap-2 text-sm text-slate-600"><span className="text-brand-gold font-bold text-xs">L</span> Leave</div>
         <div className="flex items-center gap-2 text-sm text-slate-600"><Circle className="w-4 h-4 text-slate-200" /> Unmarked</div>
         <div className="flex items-center gap-2 text-sm text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-slate-800 ml-1"></div> <span className="ml-0.5">Locked</span></div>
      </div>

      {/* Attendance Selection Modal */}
      {attendanceModal?.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Mark Attendance</h3>
              <button onClick={() => setAttendanceModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6 space-y-2">
              <p className="text-slate-600"><span className="font-semibold text-slate-800">Student:</span> {attendanceModal.student.fullName}</p>
              <p className="text-slate-600"><span className="font-semibold text-slate-800">Date:</span> {attendanceModal.day} {currentDate.toLocaleString('default', { month: 'long' })} {year}</p>
              <p className="text-amber-600 text-sm mt-2 font-medium">Note: Once marked, attendance cannot be changed.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => markAttendance(attendanceModal.student._id, attendanceModal.day, 'Present')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-green-100 hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Check className="w-6 h-6 text-green-500 mb-2" />
                <span className="font-medium text-slate-700">Present (P)</span>
              </button>
              
              <button 
                onClick={() => markAttendance(attendanceModal.student._id, attendanceModal.day, 'Absent')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-red-100 hover:border-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-6 h-6 text-red-500 mb-2" />
                <span className="font-medium text-slate-700">Absent (A)</span>
              </button>

              <button 
                onClick={() => markAttendance(attendanceModal.student._id, attendanceModal.day, 'Leave')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-brand-gold/20 hover:border-brand-gold hover:bg-brand-gold/10 transition-colors"
              >
                <span className="font-bold text-xl text-brand-gold mb-1">L</span>
                <span className="font-medium text-slate-700">Leave (L)</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
