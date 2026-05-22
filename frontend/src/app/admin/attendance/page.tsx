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

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await axios.get(`http://localhost:5000/api/attendance?month=${month}&year=${year}`);
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
    try {
      await axios.post("http://localhost:5000/api/attendance", {
        studentId,
        date: targetDate.toISOString(),
        status
      });
      // Refresh attendance
      fetchAttendance();
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
        
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
          <div className="font-bold text-slate-800 w-32 text-center">{monthName} {year}</div>
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
                  <th className="px-6 py-4 font-bold rounded-tl-xl sticky left-0 bg-slate-50 z-10 w-64 border-r border-slate-200">Student Name</th>
                  {daysArray.map(day => (
                    <th key={day} className="px-2 py-4 font-bold text-center min-w-[40px] border-b border-slate-200">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <motion.tr key={student._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-medium text-slate-800 sticky left-0 bg-white border-r border-slate-100">
                      <div>{student.fullName}</div>
                      <div className="text-xs text-slate-400 font-normal">{student.studentId}</div>
                    </td>
                    {daysArray.map(day => {
                      const targetDateStr = new Date(year, currentDate.getMonth(), day).toISOString().split('T')[0];
                      const record = attendance.find(a => 
                        a.student?._id === student._id && 
                        a.date.startsWith(targetDateStr)
                      );
                      
                      let cellContent = <Circle className="w-4 h-4 text-slate-200" />;
                      if (record) {
                        if (record.status === 'Present') cellContent = <Check className="w-4 h-4 text-green-500" />;
                        else if (record.status === 'Absent') cellContent = <X className="w-4 h-4 text-red-500" />;
                        else if (record.status === 'Leave') cellContent = <span className="text-brand-gold font-bold text-xs">L</span>;
                      }

                      return (
                        <td key={day} className="px-1 py-3 text-center border-r border-slate-50 last:border-0 group cursor-pointer relative"
                            onClick={() => {
                              // Toggle logic: None -> Present -> Absent -> Leave -> None
                              let nextStatus = 'Present';
                              if (record?.status === 'Present') nextStatus = 'Absent';
                              else if (record?.status === 'Absent') nextStatus = 'Leave';
                              else if (record?.status === 'Leave') nextStatus = 'Present';
                              markAttendance(student._id, day, nextStatus);
                            }}
                        >
                          <div className="flex justify-center items-center w-8 h-8 rounded-lg mx-auto group-hover:bg-slate-100 transition-colors">
                             {cellContent}
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <div className="p-10 text-center text-slate-500">No students found. Add students first to mark attendance.</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-4">
         <div className="flex items-center gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500" /> Present</div>
         <div className="flex items-center gap-2 text-sm text-slate-600"><X className="w-4 h-4 text-red-500" /> Absent</div>
         <div className="flex items-center gap-2 text-sm text-slate-600"><span className="text-brand-gold font-bold text-xs">L</span> Leave</div>
         <div className="flex items-center gap-2 text-sm text-slate-600"><Circle className="w-4 h-4 text-slate-200" /> Unmarked</div>
      </div>
    </div>
  );
}
