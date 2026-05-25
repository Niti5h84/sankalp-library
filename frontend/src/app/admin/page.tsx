"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Armchair, Wallet, CalendarCheck, TrendingUp, AlertCircle, Loader2, Calendar as CalendarIcon, Check, X } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tracker State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isTrackerLoading, setIsTrackerLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("https://sankalp-library.onrender.com/api/dashboard/stats");
        setStatsData(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchTrackerData = async () => {
      setIsTrackerLoading(true);
      try {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const [attRes, stdRes] = await Promise.all([
          axios.get(`https://sankalp-library.onrender.com/api/attendance?month=${month}&year=${year}`),
          axios.get("https://sankalp-library.onrender.com/api/students")
        ]);
        setAttendance(attRes.data);
        setStudents(stdRes.data);
      } catch (err) {
        console.error("Failed to fetch tracker data", err);
      } finally {
        setIsTrackerLoading(false);
      }
    };
    fetchTrackerData();
  }, [currentDate]);

  const stats = [
    { id: 1, name: "Total Students", value: statsData?.totalStudents || 0, icon: Users, color: "bg-blue-500", textColor: "text-blue-600", link: "/admin/students" },
    { id: 2, name: "Active Students", value: statsData?.activeStudents || 0, icon: UserCheck, color: "bg-green-500", textColor: "text-green-600", link: "/admin/students" },
    { id: 3, name: "Empty Seats", value: statsData?.emptySeats || 0, icon: Armchair, color: "bg-brand-gold", textColor: "text-brand-gold", link: "/admin/seats" },
    { id: 4, name: "Occupied Seats", value: statsData?.occupiedSeats || 0, icon: Armchair, color: "bg-brand-blue", textColor: "text-brand-blue", link: "/admin/seats" },
    { id: 5, name: "Today Attendance", value: statsData?.todayAttendance || 0, icon: CalendarCheck, color: "bg-purple-500", textColor: "text-purple-600", link: "/admin/attendance" },
    { id: 6, name: "Total Collection", value: `₹${statsData?.totalCollection || 0}`, icon: Wallet, color: "bg-emerald-500", textColor: "text-emerald-600", link: "/admin/fees" },
    { id: 7, name: "Pending Fees", value: `₹${statsData?.pendingFees || 0}`, icon: AlertCircle, color: "bg-red-500", textColor: "text-red-600", link: "/admin/fees" },
    { id: 8, name: "Monthly Revenue", value: `₹${statsData?.monthlyRevenue || 0}`, icon: TrendingUp, color: "bg-indigo-500", textColor: "text-indigo-600", link: "/admin/reports" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-brand-blue rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h2>
          <p className="text-blue-200">Here is what's happening at Sankalp Library today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => router.push(stat.link)}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Monthly Attendance Tracker */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-brand-blue" />
              Monthly Attendance Tracker
            </h3>
            <p className="text-slate-500 text-sm mt-1">Track Present, Absent, and Leave totals for every student.</p>
          </div>
          
          <div className="flex gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            <select 
              value={currentDate.getMonth()} 
              onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer px-2 py-1"
            >
              {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <span className="text-slate-300">|</span>
            <select 
              value={currentDate.getFullYear()} 
              onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer px-2 py-1"
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {isTrackerLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-slate-200">Student Info</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 text-center">Total Present (P)</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 text-center">Total Absent (A)</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200 text-center">Total Leave (L)</th>
                  <th className="px-6 py-4 font-bold border-b border-slate-200">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const studentRecords = attendance.filter(a => a.student?._id === student._id);
                  const pCount = studentRecords.filter(a => a.status === 'Present').length;
                  const aCount = studentRecords.filter(a => a.status === 'Absent').length;
                  const lCount = studentRecords.filter(a => a.status === 'Leave').length;
                  const totalMarked = pCount + aCount + lCount;
                  const percent = totalMarked === 0 ? 0 : Math.round((pCount / totalMarked) * 100);

                  return (
                    <tr 
                      key={student._id} 
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-base">{student.fullName}</div>
                        <div className="text-slate-500 text-xs mt-0.5">Room No: <span className="font-medium text-slate-700">{student.studentId}</span></div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100 font-bold text-base">
                          <Check className="w-4 h-4" /> {pCount}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100 font-bold text-base">
                          <X className="w-4 h-4" /> {aCount}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100 font-bold text-base">
                          <span className="font-black text-sm">L</span> {lCount}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden max-w-[120px]">
                            <div 
                              className={`h-2.5 rounded-full ${percent >= 75 ? 'bg-green-500' : percent >= 50 ? 'bg-brand-gold' : 'bg-red-500'}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-700 w-10">{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-10 text-slate-500">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
