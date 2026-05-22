"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, User, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to register admin. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-brand-gold blur-[100px] opacity-20"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 z-10 relative"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-gold/20 p-4 rounded-full mb-4 ring-1 ring-brand-gold/50">
            <ShieldCheck className="w-10 h-10 text-brand-gold" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Create Admin</h2>
          <p className="text-blue-200 mt-2 text-center text-sm">
            Register a new Admin account for Sankalp Library
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
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-green-500/20 border border-green-500/50 text-green-200 p-3 rounded-xl mb-6 text-sm text-center"
          >
            Admin account created successfully! Redirecting to login...
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-100">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-blue-300" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                placeholder="Rahul Admin"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-100">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-blue-300" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                placeholder="admin@sankalp.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-100">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-blue-300" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-blue font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg hover:shadow-brand-gold/20"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Register Admin <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
           <Link href="/admin/login" className="text-sm text-blue-200 hover:text-white transition-colors">
             Already have an account? Sign in
           </Link>
        </div>
      </motion.div>
    </div>
  );
}
