"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Armchair, Wallet, CalendarCheck, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const stats = [
    { id: 1, name: "Total Students", value: statsData?.totalStudents || 0, icon: Users, color: "bg-blue-500", textColor: "text-blue-600", link: "/admin/students" },
    { id: 2, name: "Active Students", value: statsData?.activeStudents || 0, icon: UserCheck, color: "bg-green-500", textColor: "text-green-600", link: "/admin/students" },
    { id: 3, name: "Empty Seats", value: statsData?.emptySeats || 0, icon: Armchair, color: "bg-brand-gold", textColor: "text-brand-gold", link: "/admin/seats" },
    { id: 4, name: "Occupied Seats", value: statsData?.occupiedSeats || 0, icon: Armchair, color: "bg-brand-blue", textColor: "text-brand-blue", link: "/admin/seats" },
    { id: 5, name: "Today Attendance", value: statsData?.todayAttendance || 0, icon: CalendarCheck, color: "bg-purple-500", textColor: "text-purple-600", link: "/admin/attendance" },
    { id: 6, name: "Today Collection", value: `₹${statsData?.todayCollection || 0}`, icon: Wallet, color: "bg-emerald-500", textColor: "text-emerald-600", link: "/admin/fees" },
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

      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Recent Admissions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-center h-48 text-slate-400">
              <p>No recent admissions today.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Seat Occupancy Chart</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-center h-48 text-slate-400">
              <p>Chart data will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
