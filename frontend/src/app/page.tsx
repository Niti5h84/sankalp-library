"use client";

import { motion } from "framer-motion";
import { BookOpen, User, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-blue text-white overflow-hidden relative flex flex-col justify-center items-center">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-brand-gold blur-[120px] opacity-20"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-brand-blue-light blur-[100px] opacity-30"
        />
      </div>

      <div className="z-10 container mx-auto px-6 py-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md inline-block border border-white/10 mb-6">
            <BookOpen className="w-16 h-16 text-brand-gold" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
            Sankalp <span className="text-brand-gold">Library</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl font-light">
            Premium Study Center & Reading Room Management System
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-12"
        >
          {/* Admin Portal Card */}
          <Link href="/admin/login" className="group">
            <div className="bg-brand-blue-light/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-brand-blue-light/60 transition-all duration-300 hover:border-brand-gold/50 flex flex-col items-center text-center h-full group-hover:-translate-y-2 shadow-2xl">
              <div className="bg-brand-gold/20 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-10 h-10 text-brand-gold" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Admin Portal</h2>
              <p className="text-blue-200 mb-8 flex-grow">
                Manage students, seats, fees, and monitor center statistics in real-time.
              </p>
              <div className="flex items-center text-brand-gold font-medium group-hover:text-white transition-colors">
                Access Dashboard <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Student Portal Card */}
          <Link href="/student/login" className="group">
            <div className="bg-brand-blue-light/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:bg-brand-blue-light/60 transition-all duration-300 hover:border-white/50 flex flex-col items-center text-center h-full group-hover:-translate-y-2 shadow-2xl">
              <div className="bg-white/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Student Panel</h2>
              <p className="text-blue-200 mb-8 flex-grow">
                View your attendance, fee receipts, seat details, and important notifications.
              </p>
              <div className="flex items-center text-white font-medium group-hover:text-brand-gold transition-colors">
                Student Login <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-blue-300/60 text-sm font-light z-10"
      >
        &copy; {new Date().getFullYear()} Sankalp Library. All rights reserved.
      </motion.div>
    </main>
  );
}
