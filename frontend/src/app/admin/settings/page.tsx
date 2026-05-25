"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, Key, HelpCircle } from "lucide-react";
import axios from "axios";

export default function SettingsPage() {
  const [securityPin, setSecurityPin] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("What is your library's city?");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setStatus("");
    try {
      const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
      if (!adminData.id) {
        setStatus("Admin not logged in properly.");
        return;
      }
      
      const res = await axios.post("https://sankalp-library.onrender.com/api/auth/update-security", {
        adminId: adminData.id,
        securityPin,
        securityQuestion,
        securityAnswer
      });
      setStatus(res.data.msg || "Security settings updated successfully!");
    } catch (err: any) {
      setStatus(err.response?.data?.msg || "Failed to update security settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-brand-gold/20 p-3 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-brand-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Security Settings</h2>
            <p className="text-slate-500 text-sm">Setup your recovery PIN and Question to reset your password anytime.</p>
          </div>
        </div>

        {status && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${status.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status}
          </div>
        )}

        <form onSubmit={handleUpdateSecurity} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Security PIN (4 or 6 Digits)</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input type="password" required value={securityPin} onChange={(e) => setSecurityPin(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue" placeholder="e.g. 1234 or 987654" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Security Question</label>
            <div className="relative">
              <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue bg-white appearance-none">
                <option>What is your library's city?</option>
                <option>What is your favorite book?</option>
                <option>What is the name of your first school?</option>
                <option>What is your mother's maiden name?</option>
                <option>What is your pet's name?</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Security Answer</label>
            <input type="text" required value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-brand-blue" placeholder="Your Answer" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center mt-4">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Security Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
