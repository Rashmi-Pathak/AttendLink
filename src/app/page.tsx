import Link from 'next/link';
import { FaBroadcastTower, FaMapMarkerAlt, FaShieldAlt, FaUserGraduate, FaChalkboardTeacher, FaCheckCircle, FaWifi } from 'react-icons/fa';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1121] text-slate-200 flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/50 bg-[#0B1121]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <FaBroadcastTower className="text-white text-lg" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">
                AttendLink
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24 text-center flex-1 flex flex-col justify-center">
        
        <div className="inline-flex items-center gap-2 self-center px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-cyan-400 text-xs sm:text-sm font-medium mb-8 backdrop-blur-sm shadow-[0_0_10px_rgba(6,182,212,0.1)]">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Wireless Communication & Location-Aware System</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Smart, Secure & <br/>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            Location-Aware
          </span>{' '}
          Attendance
        </h1>

        <p className="mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          AttendLink combines digital session management with real-time browser geolocation and geofence boundary verification to eliminate proxy attendance.
        </p>

        {/* Action Cards */}
        <div className="mt-16 max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Link
            href="/login"
            className="group relative p-8 rounded-2xl bg-[#131B2E] border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] text-left flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-cyan-500/20 transition-all" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 text-xl mb-5 group-hover:scale-110 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
                <FaChalkboardTeacher />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                Faculty Portal
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Launch timed sessions, define geofence boundaries, track live attendees, and access historical analytics.
              </p>
            </div>
          </Link>

          <Link
            href="/login"
            className="group relative p-8 rounded-2xl bg-[#131B2E] border border-slate-800 hover:border-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] text-left flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 text-xl mb-5 group-hover:scale-110 group-hover:border-blue-500/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300">
                <FaUserGraduate />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors mb-2">
                Student Dashboard
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Check-in securely via GPS verification, track your personal attendance stats, and view active sessions.
              </p>
            </div>
          </Link>
        </div>

        {/* Feature pillars */}
        <div className="mt-24 max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-lg mb-4">
              <FaShieldAlt />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Anti-Proxy Integrity</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Enforces physical perimeter constraints and strict one-device fingerprinting policies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-lg mb-4">
              <FaMapMarkerAlt />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Dynamic Geofence</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instructors configure precision radii (e.g., 30m - 100m) tailored to specific lecture rooms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 text-lg mb-4">
              <FaCheckCircle />
            </div>
            <h4 className="text-base font-semibold text-white mb-2">Instant Exports</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate formatted PDF reports and direct-to-Excel CSV records with verified timestamps.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0B1121] py-8 text-center text-sm text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AttendLink</span>
            <span>—</span>
            <span>Smart Wireless & Location-Aware Attendance System</span>
          </div>
          <div>Academic Project</div>
        </div>
      </footer>
    </main>
  );
}
