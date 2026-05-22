"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function StudentLogin() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("https://sankalp-library.onrender.com/api/auth/student-login", { studentId, password });
      
      // Store token
      localStorage.setItem("studentToken", res.data.token);
      localStorage.setItem("studentInfo", JSON.stringify(res.data.student));
      
      router.push("/student/dashboard"); // Assuming a dashboard exists or will exist
    } catch (err: any) {
      setError(err.response?.data?.msg || "Invalid credentials or server is down.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-brand-gold blur-[100px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-brand-blue-light blur-[120px] opacity-30"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 z-10 relative"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white/10 p-4 rounded-full mb-4 ring-1 ring-white/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Student Login</h2>
          <p className="text-blue-200 mt-2 text-center text-sm">
            Welcome back to Sankalp Library
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-100">Student ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-blue-300" />
              </div>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                placeholder="e.g. SANKALP001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-blue-100">Password</label>
              <a href="#" className="text-xs text-brand-gold hover:text-brand-gold-light transition-colors">Forgot Password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-blue-300" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-blue-50 text-brand-blue font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg hover:shadow-white/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-blue" />
            ) : (
              <>
                Sign In <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
           <Link href="/" className="text-sm text-blue-200 hover:text-white transition-colors">
             &larr; Back to Home
           </Link>
        </div>
      </motion.div>
    </div>
  );
}
