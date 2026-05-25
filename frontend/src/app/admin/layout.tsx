"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, Users, Grid, CalendarCheck, 
  Wallet, Clock, Bell, Settings, LogOut, Menu, X, BookOpen 
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dueStudents, setDueStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchDues = async () => {
      try {
        const res = await axios.get("https://sankalp-library.onrender.com/api/students");
        const today = new Date();
        const dues = res.data.filter((s: any) => {
          const isExpired = new Date(s.feeExpiryDate) < today;
          const isPartial = Number(s.paidAmount) < Number(s.monthlyFee);
          return isExpired || isPartial;
        });
        setDueStudents(dues);
      } catch (e) {}
    };
    fetchDues();
  }, [pathname]);

  const VAPID_PUBLIC_KEY = "BFbGamOTican6hGse9lVbFgKpLosHybPs_F1PqmyTyfK8TzOKscFAr4TA3dLc096A4ALVv8Fz9qBZL-wXQdHkcY";

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  useEffect(() => {
    const setupNotifications = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
          }
          
          if (adminUser.email) {
            await axios.post('https://sankalp-library.onrender.com/api/notifications/subscribe', {
              subscription,
              adminEmail: adminUser.email
            });
          }
        } catch (error) {
          console.error('Service Worker Error', error);
        }
      }
    };

    if (adminUser.email && adminUser.email !== "admin@sankalp.com") {
      setupNotifications();
    }
  }, [adminUser.email]);

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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? "280px" : "80px" }}
        className={`bg-brand-blue text-white shrink-0 flex-col transition-all duration-300 z-50 shadow-2xl print:hidden ${mobileMenuOpen ? 'flex absolute inset-y-0 left-0' : 'hidden md:flex md:relative'}`}
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
          
          <div className="flex items-center space-x-6 relative">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative text-slate-400 hover:text-brand-blue transition-colors">
              <Bell size={24} />
              {dueStudents.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
                  {dueStudents.length > 9 ? '9+' : dueStudents.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute top-10 right-16 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 max-h-96 flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-slate-800 text-sm">Fee Dues Alerts</h3>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{dueStudents.length} Pending</span>
                </div>
                <div className="overflow-y-auto custom-scrollbar flex-1">
                  {dueStudents.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">No pending dues! 🎉</div>
                  ) : (
                    dueStudents.map(student => {
                      const isExpired = new Date(student.feeExpiryDate) < new Date();
                      const dueAmount = Number(student.monthlyFee) - Number(student.paidAmount);
                      
                      return (
                        <div key={student._id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer" onClick={() => { setNotificationsOpen(false); router.push('/admin/fees'); }}>
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {student.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{student.fullName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {isExpired 
                                ? `Fee Expired on ${new Date(student.feeExpiryDate).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}` 
                                : `₹${dueAmount} Pending`}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 shrink-0">
                  <button onClick={() => { setNotificationsOpen(false); router.push('/admin/fees'); }} className="w-full py-2 text-xs font-bold text-brand-blue hover:bg-blue-50 rounded-lg transition-colors">
                    View All Fees
                  </button>
                </div>
              </div>
            )}

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
