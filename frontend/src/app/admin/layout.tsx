"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, Users, Grid, CalendarCheck, 
  Wallet, Clock, Bell, Settings, LogOut, Menu, X, BookOpen 
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Seats", href: "/admin/seats", icon: Grid },
  { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { name: "Fees", href: "/admin/fees", icon: Wallet },
  { name: "Shifts", href: "/admin/shifts", icon: Clock },
  { name: "Reports", href: "/admin/reports", icon: Bell }, // Used Bell for now as generic, maybe Reports icon
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({ name: "Admin", email: "admin@sankalp.com", initial: "A" });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("adminData");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setAdminUser({
          name: parsed.name || "Admin",
          email: parsed.email || "admin@sankalp.com",
          initial: (parsed.name || "A").charAt(0).toUpperCase()
        });
      } catch (e) {}
    }
  }, [pathname]);

  if (pathname === '/admin/login' || pathname === '/admin/register') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? "280px" : "80px" }}
        className={`bg-brand-blue text-white shrink-0 flex-col transition-all duration-300 z-30 shadow-2xl print:hidden ${mobileMenuOpen ? 'flex absolute inset-y-0 left-0' : 'hidden md:flex md:relative'}`}
      >
        <div className="h-20 flex items-center justify-center border-b border-white/10 px-4">
          <BookOpen className={`text-brand-gold shrink-0 ${sidebarOpen ? 'w-8 h-8 mr-3' : 'w-10 h-10'}`} />
          {sidebarOpen && <span className="font-bold text-xl whitespace-nowrap">Sankalp Library</span>}
        </div>

        <button 
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setMobileMenuOpen(false);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }}
          className="absolute -right-4 top-6 bg-brand-gold text-brand-blue p-1 rounded-full shadow-lg hover:scale-110 transition-transform md:flex z-50"
        >
          {(sidebarOpen || mobileMenuOpen) ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            
            return (
              <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                  isActive 
                  ? "bg-brand-gold text-brand-blue shadow-lg font-medium" 
                  : "text-blue-100 hover:bg-white/10"
                }`}>
                  <Icon className={`shrink-0 ${sidebarOpen ? 'mr-4' : 'mx-auto'} ${isActive ? 'text-brand-blue' : 'text-blue-200 group-hover:text-brand-gold'}`} size={22} />
                  {sidebarOpen && <span>{link.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div 
            onClick={() => { setMobileMenuOpen(false); router.push('/admin/login'); }}
            className="flex items-center px-4 py-3 rounded-xl cursor-pointer text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={22} className={sidebarOpen ? "mr-4" : "mx-auto"} />
            {sidebarOpen && <span>Logout</span>}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10 shrink-0 print:hidden relative">
          <div className="flex items-center">
             {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden mr-4 text-brand-blue p-2 rounded-lg hover:bg-slate-100">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-brand-blue hidden sm:block">
              {sidebarLinks.find(l => pathname === l.href)?.name || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="relative text-slate-400 hover:text-brand-blue transition-colors">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="relative">
              <div 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-3 cursor-pointer pl-6 border-l border-slate-200 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800">{adminUser.name}</p>
                  <p className="text-xs text-slate-500">Manager</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-brand-gold">
                  {adminUser.initial}
                </div>
              </div>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-bold text-slate-800">{adminUser.name}</p>
                    <p className="text-xs text-slate-500 truncate">{adminUser.email}</p>
                  </div>
                  <button onClick={() => { setProfileOpen(false); router.push('/admin/settings'); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-colors flex items-center">
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </button>
                  <button onClick={() => { setProfileOpen(false); router.push('/admin/login'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center mt-1">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50/50 p-6 md:p-8 text-slate-800">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
