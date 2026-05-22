"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, User as UserIcon, CalendarCheck, Armchair } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      router.push("/admin/login"); // Unified login page
    } else {
      // Decode JWT or fetch user details. For now just parsing basic payload if possible, or using mock name
      setStudent({ name: "Student", id: "STU-XXXX" }); 
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    router.push("/admin/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
    { name: "My Seat", icon: Armchair, path: "/student/seat" },
    { name: "Attendance", icon: CalendarCheck, path: "/student/attendance" },
    { name: "Profile", icon: UserIcon, path: "/student/profile" },
  ];

  if (!student) return null; // or loading spinner

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Student Sidebar */}
      <aside className="w-72 bg-brand-blue text-white flex flex-col shadow-2xl relative z-20 hidden md:flex">
        <div className="p-8 pb-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center">
            <span className="text-brand-blue font-bold text-xl">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sankalp Library</h1>
            <p className="text-brand-gold text-xs font-medium tracking-wider uppercase mt-1">Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive ? "bg-brand-gold text-brand-blue font-bold shadow-md" : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-brand-blue" : "text-blue-200"}`} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-300 hover:text-white hover:bg-red-500/20 px-4 py-3 rounded-xl transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-end px-8 shadow-sm relative z-10">
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{student.name}</p>
              <p className="text-xs text-brand-blue font-medium">{student.id}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-brand-gold flex items-center justify-center text-brand-blue font-bold shadow-sm">
              S
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
