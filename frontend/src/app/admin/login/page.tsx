"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset Password State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [recoveryMethod, setRecoveryMethod] = useState<"pin" | "question">("pin");
  const [securityPin, setSecurityPin] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("What is your library's city?");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      const res = await axios.post("https://sankalp-library.onrender.com/api/auth/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminData", JSON.stringify(res.data.admin));
      router.push("/admin");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Invalid credentials or server is down.");
    } finally { setIsLoading(false); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setForgotStatus("");
    try {
      const res = await axios.post("https://sankalp-library.onrender.com/api/auth/reset-password-direct", { 
        email: forgotEmail, 
        newPassword,
        securityPin: recoveryMethod === "pin" ? securityPin : undefined,
        securityQuestion: recoveryMethod === "question" ? securityQuestion : undefined,
        securityAnswer: recoveryMethod === "question" ? securityAnswer : undefined,
        recoveryMethod
      });
      setForgotStatus(res.data.msg || "Password updated successfully!");
      if (res.data.msg && res.data.msg.includes("successfully")) {
        setForgotEmail("");
        setNewPassword("");
        setSecurityPin("");
        setSecurityAnswer("");
        setTimeout(() => setIsForgotModalOpen(false), 2000);
      }
    } catch (err: any) {
      setForgotStatus(err.response?.data?.msg || "Failed to update password.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand-blue flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-gold blur-[100px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500 blur-[120px] opacity-10"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 z-10 relative"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-gold/20 p-4 rounded-full mb-4 ring-1 ring-brand-gold/50">
            <ShieldCheck className="w-10 h-10 text-brand-gold" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Admin Login
          </h2>
          <p className="text-blue-200 mt-2 text-center text-sm">
            Manage your Library System
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-100">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-brand-gold outline-none transition-all" placeholder="admin@sankalp.com" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-medium text-blue-100">Password</label>
              <button type="button" onClick={() => { setIsForgotModalOpen(true); setForgotStatus(""); }} className="text-brand-gold hover:underline">Forgot Password?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-brand-gold outline-none transition-all" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-blue font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center mt-4">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5 ml-2" /></>}
          </button>
          <div className="text-center pt-4 border-t border-white/10 mt-6 text-sm text-blue-200">
            New to the system? <Link href="/admin/register" className="text-white hover:underline">Create Admin</Link>
          </div>
        </form>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 relative">
              <h3 className="font-bold text-xl text-slate-800 mb-2">Reset Password</h3>
              <p className="text-sm text-slate-500 mb-4">Choose a method to reset your password.</p>
              
              {/* Method Selection */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                <button type="button" onClick={() => setRecoveryMethod("pin")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${recoveryMethod === "pin" ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  Security PIN
                </button>
                <button type="button" onClick={() => setRecoveryMethod("question")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${recoveryMethod === "question" ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  Security Question
                </button>
              </div>

              {forgotStatus && (
                 <div className={`p-3 rounded-xl mb-4 text-sm ${forgotStatus.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                   {forgotStatus}
                 </div>
              )}
              <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Admin Email</label>
                  <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-slate-800 bg-white" placeholder="e.g. admin@example.com" />
                </div>
                
                {recoveryMethod === "pin" ? (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Security PIN</label>
                    <input type="password" required value={securityPin} onChange={(e) => setSecurityPin(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-slate-800 bg-white" placeholder="Enter your 4 or 6 digit PIN" />
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">1. Select your Security Question</label>
                      <select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 bg-white text-slate-800 cursor-pointer shadow-sm">
                        <option>What is your library's city?</option>
                        <option>What is your favorite book?</option>
                        <option>What is the name of your first school?</option>
                        <option>What is your mother's maiden name?</option>
                        <option>What is your pet's name?</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase ml-1">2. Write your Answer</label>
                      <input type="text" required value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-sm text-slate-800 bg-white" placeholder="Enter your answer here" />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">New Password</label>
                  <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all text-slate-800 bg-white" placeholder="Enter new password (min 6 chars)" />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsForgotModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold flex justify-center items-center transition-colors shadow-md">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
