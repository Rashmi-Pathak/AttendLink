'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FaMapMarkerAlt,
    FaUsers,
    FaDownload,
    FaStopCircle,
    FaCopy,
    FaClock,
    FaBroadcastTower,
    FaArrowLeft,
    FaFileCsv,
    FaCheck,
    FaExclamationCircle
} from 'react-icons/fa';

export default function ProfessorDashboard() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        professorName: '',
        courseCode: '',
        radius: 50,
        durationMinutes: 15,
    });
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState(false);

    const createSession = async () => {
        setLoading(true);
        setError('');

        if (!formData.professorName.trim() || !formData.courseCode.trim()) {
            setError('Please provide both Instructor Name and Course Code.');
            setLoading(false);
            return;
        }

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await fetch('/api/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...formData,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        }),
                    });

                    if (!res.ok) throw new Error('Failed to initialize attendance session');
                    const data = await res.json();
                    setSession(data);
                } catch (err: any) {
                    setError(err.message || 'Error creating attendance session');
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setError('Unable to acquire location coordinates: ' + err.message + '. Please ensure location permissions are granted.');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const refreshSession = async () => {
        if (!session) return;
        try {
            const res = await fetch(`/api/session/${session.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data && !data.error) {
                    setSession(data);
                }
            }
        } catch (err) {
            console.error('Failed to sync session state:', err);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (session && session.isActive) {
            interval = setInterval(refreshSession, 5000);
        }
        return () => clearInterval(interval);
    }, [session]);

    useEffect(() => {
        if (!session || !session.expiresAt || !session.isActive) {
            setTimeLeft('');
            return;
        }

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const expires = new Date(session.expiresAt).getTime();
            const diff = expires - now;

            if (diff <= 0) {
                setTimeLeft('Session Expired');
                clearInterval(timer);
            } else {
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [session]);

    const stopSession = async () => {
        if (!session) return;
        try {
            await fetch(`/api/session/${session.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: false }),
            });
            refreshSession();
        } catch (err) {
            console.error('Failed to close session:', err);
        }
    };

    const copyToClipboard = async () => {
        const link = `${window.location.origin}/student/${session.id}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2500);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const savePDF = async () => {
        if (!session?.attendees) return;

        try {
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;

            const doc = new jsPDF();

            // Header Banner
            doc.setFillColor(30, 41, 59);
            doc.rect(0, 0, 210, 30, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.text('AttendLink — Attendance Verification Report', 14, 18);

            // Metadata block
            doc.setTextColor(51, 65, 85);
            doc.setFontSize(10);
            doc.text(`Course Code: ${session.courseCode}`, 14, 38);
            doc.text(`Faculty / Instructor: ${session.professorName}`, 14, 44);
            doc.text(`Date & Time: ${new Date(session.createdAt).toLocaleString()}`, 14, 50);
            doc.text(`Geofence Radius: ${session.radius} meters`, 14, 56);
            doc.text(`Verified Attendees: ${session.attendees.length}`, 14, 62);

            const tableColumn = ["#", "Student Name", "Roll Number", "Verification Time", "Status"];
            const tableRows = session.attendees.map((att: any, idx: number) => [
                idx + 1,
                att.studentName,
                att.rollNumber,
                new Date(att.timestamp).toLocaleTimeString(),
                "Verified Present"
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 70,
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] },
                styles: { fontSize: 9 },
            });

            doc.save(`attendlink-${session.courseCode}-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error('PDF generation error:', err);
            alert('Failed to generate PDF report');
        }
    };

    const isExpired = session?.expiresAt && new Date() > new Date(session.expiresAt);
    const status = !session?.isActive ? 'Closed' : isExpired ? 'Expired' : 'Active';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
            {/* Top Navigation Bar */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors">
                            <FaArrowLeft className="text-sm" />
                        </Link>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                            <FaBroadcastTower className="text-sm" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-200 tracking-tight">AttendLink</span>
                            <span className="text-slate-500 text-xs ml-2 hidden sm:inline">Faculty Console</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            GPS Coordinate Anchor Ready
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {!session ? (
                    /* Session Creation Form */
                    <div className="max-w-xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Launch Attendance Session
                            </h1>
                            <p className="mt-2 text-sm text-slate-400">
                                Capture your physical location to anchor a geofence zone for student wireless check-ins.
                            </p>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
                                    <FaExclamationCircle className="text-red-400 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                        Faculty / Instructor Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dr. Jane Doe"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                        value={formData.professorName}
                                        onChange={(e) => setFormData({ ...formData, professorName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                        Course Code / Lecture Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. WCS401 - Wireless Systems"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                        value={formData.courseCode}
                                        onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                                                Geofence Radius
                                            </label>
                                            <span className="text-xs font-mono text-indigo-400">{formData.radius} meters</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="10"
                                            max="500"
                                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                            value={formData.radius}
                                            onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) })}
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1">Recommended: 30m - 100m for classroom</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                                                Active Duration
                                            </label>
                                            <span className="text-xs font-mono text-indigo-400">{formData.durationMinutes} min</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            max="180"
                                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                            value={formData.durationMinutes}
                                            onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1">Session auto-closes after timeout</p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={createSession}
                                        disabled={loading}
                                        className="w-full py-3.5 px-6 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                                    >
                                        <FaMapMarkerAlt />
                                        <span>{loading ? 'Acquiring GPS & Starting...' : 'Anchor Geofence & Start Session'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Active Session Console */
                    <div className="space-y-6">
                        {/* Session Status Header Card */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                            {session.courseCode}
                                        </h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${
                                            status === 'Active'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                : status === 'Expired'
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                        }`}>
                                            {status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Instructor: <span className="text-slate-200 font-medium">{session.professorName}</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {session.expiresAt && status === 'Active' && (
                                        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-xl text-indigo-300 text-sm">
                                            <FaClock className="text-xs" />
                                            <span className="font-mono font-semibold">{timeLeft}</span>
                                        </div>
                                    )}

                                    {session.isActive && (
                                        <button
                                            onClick={stopSession}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all"
                                        >
                                            <FaStopCircle /> Close Session
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Session Key Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-800">
                                <div>
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400">Total Attendees</div>
                                    <div className="text-2xl font-bold text-white mt-0.5">{session.attendees?.length || 0}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400">Geofence Radius</div>
                                    <div className="text-2xl font-bold text-indigo-400 mt-0.5">{session.radius}m</div>
                                </div>
                                <div>
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400">Latitude Anchor</div>
                                    <div className="text-sm font-mono text-slate-300 mt-1.5">{session.latitude?.toFixed(5)}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] uppercase tracking-wider text-slate-400">Longitude Anchor</div>
                                    <div className="text-sm font-mono text-slate-300 mt-1.5">{session.longitude?.toFixed(5)}</div>
                                </div>
                            </div>

                            {/* Sharing link container */}
                            <div className="pt-6">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                    Student Check-In Link (Share with Class)
                                </label>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-indigo-300 truncate select-all">
                                        {typeof window !== 'undefined' ? `${window.location.origin}/student/${session.id}` : `/student/${session.id}`}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                                    >
                                        {copySuccess ? <FaCheck className="text-emerald-300" /> : <FaCopy />}
                                        <span>{copySuccess ? 'Link Copied!' : 'Copy Link'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Attendees List Card */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <FaUsers />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Live Attendance Stream</h3>
                                        <p className="text-xs text-slate-400">Auto-refreshes every 5 seconds</p>
                                    </div>
                                </div>

                                {/* Export Options */}
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/api/export/${session.id}`}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                                    >
                                        <FaFileCsv className="text-emerald-400 text-sm" />
                                        <span>Export CSV</span>
                                    </a>
                                    <button
                                        onClick={savePDF}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20"
                                    >
                                        <FaDownload />
                                        <span>Export PDF</span>
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-800">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-slate-950/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                                            <th className="py-3 px-4 font-semibold">#</th>
                                            <th className="py-3 px-4 font-semibold">Student Name</th>
                                            <th className="py-3 px-4 font-semibold">Roll Number</th>
                                            <th className="py-3 px-4 font-semibold">Time Verified</th>
                                            <th className="py-3 px-4 font-semibold">Location Delta</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {session.attendees?.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                                                    Waiting for students to connect and verify their location within the geofence...
                                                </td>
                                            </tr>
                                        ) : (
                                            session.attendees?.map((att: any, idx: number) => (
                                                <tr key={att.id} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-3 px-4 text-slate-500 text-xs font-mono">{idx + 1}</td>
                                                    <td className="py-3 px-4 font-medium text-white">{att.studentName}</td>
                                                    <td className="py-3 px-4 font-mono text-indigo-300 text-xs">{att.rollNumber}</td>
                                                    <td className="py-3 px-4 text-slate-400 text-xs">
                                                        {new Date(att.timestamp).toLocaleTimeString()}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            Within {session.radius}m
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
