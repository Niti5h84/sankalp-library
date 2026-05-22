"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Loader2, Check, X, Circle } from "lucide-react";
import axios from "axios";

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, this ID comes from the decoded JWT. Hardcoding for demo.
  const studentId = "DEMO-STU-ID"; 

  useEffect(() => {
    // We would fetch attendance for the logged-in student
    // axios.get(`/api/attendance?studentId=${studentId}`)
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-brand-blue" /> My Attendance
        </h2>
        <p className="text-slate-500 text-sm mt-1">View your daily attendance records for this month.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 text-purple-600 mb-4">
          <CalendarIcon className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No Records Found</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">Your attendance records will appear here once marked by the administrator.</p>
      </div>
    </div>
  );
}
