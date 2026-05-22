"use client";

import { motion } from "framer-motion";
import { Armchair, CalendarCheck, IndianRupee, Clock } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-brand-blue rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome to your Portal! 👋</h2>
          <p className="text-blue-200">Track your attendance, view seat details, and manage fees.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-gold/10 text-brand-gold"><Armchair className="w-6 h-6" /></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">My Seat</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">A-12</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-600"><CalendarCheck className="w-6 h-6" /></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Attendance (This Month)</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">85%</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10 text-red-600"><IndianRupee className="w-6 h-6" /></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Pending Fee</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">₹0</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600"><Clock className="w-6 h-6" /></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Shift Timing</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">Morning</h3>
        </motion.div>
      </div>
      
      {/* Messages / Notice Board */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Notice Board</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-sm font-semibold text-blue-800">Library Closed Tomorrow</p>
            <p className="text-xs text-blue-600 mt-1">Please be informed that the library will remain closed tomorrow due to maintenance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
