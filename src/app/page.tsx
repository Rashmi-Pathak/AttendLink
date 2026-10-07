import Link from 'next/link';
import { FaBroadcastTower, FaMapMarkerAlt, FaShieldAlt, FaUserGraduate, FaChalkboardTeacher, FaCheckCircle, FaWifi } from 'react-icons/fa';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background radial ambient lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-indigo-600/20 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <FaBroadcastTower className="text-white text-lg" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                AttendLink
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Wireless Geofence
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/professor"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-95"
            >
              <FaChalkboardTeacher className="text-sm" />
              <span>Faculty Portal</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 self-center px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-sm shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Wireless Communication & Location-Aware System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Smart, Secure &{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Location-Aware
          </span>{' '}
          Attendance
        </h1>

        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AttendLink combines digital session management with real-time browser geolocation and geofence boundary verification to eliminate proxy attendance in classrooms and lecture halls.
        </p>

        {/* Action Cards */}
        <div className="mt-12 max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Faculty Card */}
          <Link
            href="/professor"
            className="group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 text-left backdrop-blur-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 mb-5">
                <FaChalkboardTeacher />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                <span>Faculty / Instructor</span>
                <span className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">→</span>
              </h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Start a timed attendance session at your current coordinates, define geofence radius, track attendees live, and export verified records.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-indigo-400 font-semibold">
              <span>Launch Session Console</span>
            </div>
          </Link>

          {/* Student Flow Info Card */}
          <Link
            href="/student"
            className="group relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 text-left backdrop-blur-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 mb-5">
                <FaUserGraduate />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>Student Check-In</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Live Dashboard
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Log into your class dashboard to see live sessions instantly, authorize device coordinates, and submit verifiable presence within the geofenced zone.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-cyan-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Enter Dashboard →</span>
            </div>
          </Link>
        </div>

        {/* Architecture flow diagram banner */}
        <div className="mt-16 max-w-4xl mx-auto w-full p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FaWifi className="text-indigo-400" />
                Wireless Location Verification Pipeline
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                How proximity validation operates across the mobile/web network stack
              </p>
            </div>
            <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 w-fit">
              Haversine Validation
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs font-mono text-indigo-400 mb-1">01. CAPTURE</div>
              <div className="text-sm font-semibold text-slate-200">Browser GPS</div>
              <div className="text-[11px] text-slate-400 mt-1">High-accuracy geolocation coordinates</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs font-mono text-indigo-400 mb-1">02. TRANSMIT</div>
              <div className="text-sm font-semibold text-slate-200">Encrypted POST</div>
              <div className="text-[11px] text-slate-400 mt-1">Payload sent to AttendLink API</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs font-mono text-indigo-400 mb-1">03. VERIFY</div>
              <div className="text-sm font-semibold text-slate-200">Geofence Check</div>
              <div className="text-[11px] text-slate-400 mt-1">Radius computed against faculty anchor</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs font-mono text-emerald-400 mb-1">04. RECORD</div>
              <div className="text-sm font-semibold text-slate-200">Commit Record</div>
              <div className="text-[11px] text-slate-400 mt-1">Unique student roll number per session</div>
            </div>
          </div>
        </div>

        {/* Feature pillars */}
        <div className="mt-12 max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <FaShieldAlt className="text-sm" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Anti-Proxy Integrity</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Enforces maximum physical perimeter constraints so students must be present in the designated room.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <FaMapMarkerAlt className="text-sm" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Dynamic Geofence</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Instructors configure precision radii (e.g., 30m - 100m) tailored to lecture rooms or auditoriums.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <FaCheckCircle className="text-sm" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Instant PDF & CSV</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Generate formatted reports and CSV records with verifiable student roll numbers and timestamps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AttendLink</span>
            <span>—</span>
            <span>Smart Wireless & Location-Aware Attendance System</span>
          </div>
          <div>Academic Wireless Communication Systems Project</div>
        </div>
      </footer>
    </main>
  );
}
