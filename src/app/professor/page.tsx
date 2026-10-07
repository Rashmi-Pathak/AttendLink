'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FaMapMarkerAlt, FaUsers, FaDownload, FaStopCircle, FaCopy, FaClock, 
    FaBroadcastTower, FaArrowLeft, FaFileCsv, FaCheck, FaExclamationCircle, 
    FaChartBar, FaSignOutAlt, FaPlus, FaBook
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfessorDashboard() {
    const [user, setUser] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    
    // Create Course State
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseCohort, setNewCourseCohort] = useState('TE-IT');
    const [courseError, setCourseError] = useState('');

    // Session State
    const [session, setSession] = useState<any>(null);
    const [selectedCourseForSession, setSelectedCourseForSession] = useState<any>(null);
    const [sessionRadius, setSessionRadius] = useState(50);
    const [sessionDuration, setSessionDuration] = useState(15);
    const [loadingSession, setLoadingSession] = useState(false);
    
    // Utilities State
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [courseStats, setCourseStats] = useState<any[]>([]);
    const router = useRouter();

    const availableCohorts = ['FE-GEN', 'SE-IT', 'TE-IT', 'BE-IT', 'SE-CS', 'TE-CS', 'BE-CS', 'SE-EXTC', 'TE-EXTC', 'BE-EXTC', 'General'];

    useEffect(() => {
        const storedUser = localStorage.getItem('attendlink_user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const parsed = JSON.parse(storedUser);
        if(parsed.role !== 'PROFESSOR') {
            router.push('/login');
            return;
        }
        setUser(parsed);
        fetchCourses(parsed.id);
    }, [router]);

    const fetchCourses = async (profId: string) => {
        try {
            const res = await fetch(`/api/courses?professorId=${profId}`);
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (err) {
            console.error('Failed to fetch courses');
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setCourseError('');
        if (!newCourseName.trim()) {
            setCourseError('Course name/code is required');
            return;
        }
        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCourseName.trim().toUpperCase(),
                    cohort: newCourseCohort,
                    professorId: user.id
                })
            });
            const data = await res.json();
            if (res.ok) {
                setCourses([data, ...courses]);
                setShowCreateForm(false);
                setNewCourseName('');
            } else {
                setCourseError(data.error || 'Failed to create course');
            }
        } catch (err) {
            setCourseError('Network error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('attendlink_user');
        router.push('/login');
    };

    const startSessionForCourse = async () => {
        setLoadingSession(true);
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            setLoadingSession(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await fetch('/api/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            courseCode: selectedCourseForSession.name,
                            cohort: selectedCourseForSession.cohort,
                            professorName: user.name,
                            radius: sessionRadius,
                            durationMinutes: sessionDuration,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        }),
                    });

                    if (!res.ok) throw new Error('Failed to initialize attendance session');
                    const data = await res.json();
                    setSession(data);
                    setSelectedCourseForSession(null);
                    fetchCourseStats(data.courseCode);
                } catch (err: any) {
                    alert(err.message || 'Error creating attendance session');
                } finally {
                    setLoadingSession(false);
                }
            },
            (err) => {
                alert('Unable to acquire location coordinates. Please ensure location permissions are granted.');
                setLoadingSession(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const fetchCourseStats = async (courseCode: string) => {
        try {
            const res = await fetch(`/api/professor/stats?courseCode=${encodeURIComponent(courseCode)}`);
            if (res.ok) {
                const data = await res.json();
                setCourseStats(data || []);
            }
        } catch (err) {
            console.error('Failed to fetch course stats');
        }
    };

    const refreshSession = async () => {
        if (!session) return;
        try {
            const res = await fetch(`/api/session/${session.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data && !data.error) setSession(data);
            }
        } catch (err) {}
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
        } catch (err) {}
    };

    const copyToClipboard = async () => {
        const link = `${window.location.origin}/student/${session.id}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2500);
        } catch (err) {}
    };

    const saveCSV = () => {
        if (!session?.attendees) return;
        const headers = ['#', 'Student Name', 'Roll Number', 'Verification Time', 'Status'];
        const rows = session.attendees.map((att: any, idx: number) => [
            idx + 1, att.studentName, att.rollNumber, new Date(att.timestamp).toLocaleTimeString(), 'Verified Present'
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `attendlink-${session.courseCode}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const savePDF = async () => {
        if (!session?.attendees) return;
        try {
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;
            const doc = new jsPDF();
            doc.setFillColor(15, 23, 42); 
            doc.rect(0, 0, 210, 30, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.text('AttendLink — Verification Report', 14, 18);
            doc.setTextColor(51, 65, 85);
            doc.setFontSize(10);
            doc.text(`Course Code: ${session.courseCode}`, 14, 38);
            doc.text(`Target Class: ${session.cohort}`, 14, 44);
            doc.text(`Faculty: ${session.professorName}`, 14, 50);
            doc.text(`Date & Time: ${new Date(session.createdAt).toLocaleString()}`, 14, 56);
            doc.text(`Verified Attendees: ${session.attendees.length}`, 14, 62);
            
            const tableColumn = ["#", "Student Name", "Roll Number", "Verification Time", "Status"];
            const tableRows = session.attendees.map((att: any, idx: number) => [
                idx + 1, att.studentName, att.rollNumber, new Date(att.timestamp).toLocaleTimeString(), "Verified Present"
            ]);
            autoTable(doc, { head: [tableColumn], body: tableRows, startY: 70, theme: 'grid', headStyles: { fillColor: [6, 182, 212] }, styles: { fontSize: 9 } });
            doc.save(`attendlink-${session.courseCode}-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {}
    };

    const isExpired = session?.expiresAt && new Date() > new Date(session.expiresAt);
    const status = !session?.isActive ? 'Closed' : isExpired ? 'Expired' : 'Active';

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-white pb-20">
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none z-0" />
            
            {/* Top Navigation Bar */}
            <header className="border-b border-slate-800 bg-[#0a0f1c]/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight text-xl">AttendLink</Link>
                        <span className="text-slate-500 text-xs ml-2 hidden sm:inline uppercase tracking-wider font-semibold">Faculty Console</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-semibold uppercase shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            GPS Anchor Ready
                        </span>
                        
                        <button 
                            onClick={handleLogout}
                            className="text-xs font-semibold uppercase px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-full transition-all flex items-center gap-2"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-10 relative z-10">
                {!session ? (
                    /* Dashboard Home: Course Management */
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">My Classes</h1>
                                <p className="text-slate-400 mt-1 text-sm">Manage your subjects and launch attendance sessions.</p>
                            </div>
                            <button 
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
                            >
                                {showCreateForm ? 'Cancel' : <><FaPlus /> Create Class</>}
                            </button>
                        </div>

                        {showCreateForm && (
                            <form onSubmit={handleCreateCourse} className="bg-[#131b2e] border border-cyan-500/30 rounded-2xl p-6 mb-8 shadow-2xl animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[40px]" />
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 relative z-10"><FaBook className="text-cyan-400" /> New Class Setup</h2>
                                {courseError && <div className="text-red-400 text-sm mb-4">{courseError}</div>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Subject / Course Code</label>
                                        <input type="text" required placeholder="e.g. WAMC" className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Target Cohort</label>
                                        <select className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none" value={newCourseCohort} onChange={e => setNewCourseCohort(e.target.value)}>
                                            {availableCohorts.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button type="submit" className="w-full h-[46px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-semibold transition-colors">Save Class</button>
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.length === 0 && !showCreateForm && (
                                <div className="col-span-full border border-dashed border-slate-700 bg-slate-900/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                                    <FaBook className="text-4xl text-slate-600 mb-4" />
                                    <h3 className="text-lg font-semibold text-white">No classes yet</h3>
                                    <p className="text-slate-400 mt-2 max-w-sm">Create your first class to start launching attendance sessions for your students.</p>
                                </div>
                            )}

                            {courses.map(course => (
                                <div key={course.id} className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between group hover:border-cyan-500/30 transition-colors relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[20px] group-hover:bg-cyan-500/10 transition-colors" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-105 transition-transform border border-slate-700">
                                                <FaBook className="text-xl" />
                                            </div>
                                            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-semibold text-slate-300">{course.cohort}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-1">{course.name}</h3>
                                        <p className="text-sm text-slate-500 mb-6">Instructor: You</p>
                                    </div>

                                    {selectedCourseForSession?.id === course.id ? (
                                        <div className="bg-[#0a0f1c] border border-cyan-500/30 p-4 rounded-xl relative z-10 animate-fade-in space-y-4 shadow-inner">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">Radius (m)</span>
                                                <input type="number" min="10" max="500" className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center text-white" value={sessionRadius} onChange={e=>setSessionRadius(Number(e.target.value))} />
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">Time (mins)</span>
                                                <input type="number" min="1" max="180" className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center text-white" value={sessionDuration} onChange={e=>setSessionDuration(Number(e.target.value))} />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button onClick={() => setSelectedCourseForSession(null)} className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">Cancel</button>
                                                <button onClick={startSessionForCourse} disabled={loadingSession} className="flex-1 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                                    {loadingSession ? <FaClock className="animate-spin" /> : 'Start!'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setSelectedCourseForSession(course)}
                                            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-semibold text-sm transition-colors relative z-10 flex items-center justify-center gap-2"
                                        >
                                            <FaBroadcastTower /> Launch Session
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Active Session Dashboard */
                    <div className="space-y-6 animate-fade-in">
                        {/* Same existing Active Session code... */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{session.courseCode} Attendance</h2>
                                            <p className="text-sm text-slate-400 mt-1">Instructor: You | Target: <span className="text-cyan-400">{session.cohort}</span></p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold uppercase rounded-full border ${status === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                            {status}
                                        </span>
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <div className="flex items-center gap-2 text-sm bg-slate-900/50 border border-slate-700 rounded-full px-4 py-1.5">
                                            <FaMapMarkerAlt className="text-cyan-400" />
                                            <span className="text-slate-300">Radius: {session.radius}m</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm bg-slate-900/50 border border-slate-700 rounded-full px-4 py-1.5">
                                            <FaUsers className="text-blue-400" />
                                            <span className="text-slate-300">{session.attendees?.length || 0} Present</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex-1 py-3 px-4 font-semibold text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        {copySuccess ? <><FaCheck className="text-emerald-400"/> Copied</> : <><FaCopy /> Share Link</>}
                                    </button>
                                    {status === 'Active' && (
                                        <button
                                            onClick={stopSession}
                                            className="flex-1 py-3 px-4 font-semibold text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <FaStopCircle /> Close Session
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                                <div className="w-16 h-16 bg-[#0a0f1c] border border-slate-700 rounded-full flex items-center justify-center text-cyan-400 mb-4 relative z-10 shadow-inner">
                                    <FaClock className="text-2xl" />
                                </div>
                                <h3 className="text-xs font-semibold uppercase text-slate-400 mb-1 relative z-10">Time Remaining</h3>
                                <div className="text-3xl font-bold text-white relative z-10 tracking-tight">
                                    {timeLeft || '0m 0s'}
                                </div>
                            </div>
                        </div>
                        
                        {/* Course Analytics */}
                        {courseStats.length > 0 && (
                            <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 shadow-xl">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20"><FaChartBar /></span> 
                                    Course Analytics
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={courseStats} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} stroke="#334155" />
                                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} stroke="#334155" />
                                            <Tooltip
                                                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                                            />
                                            <Bar dataKey="attendees" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Attendees List */}
                        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <h3 className="text-lg font-semibold text-white">Live Attendance Log</h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={saveCSV}
                                        className="py-2 px-4 text-xs font-semibold bg-[#0a0f1c] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <FaFileCsv className="text-sm text-cyan-400" /> Export CSV
                                    </button>
                                    <button
                                        onClick={savePDF}
                                        className="py-2 px-4 text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                                    >
                                        <FaDownload className="text-sm" /> Export PDF
                                    </button>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0a0f1c]">
                                        <tr>
                                            <th className="p-4 text-xs font-semibold text-slate-400 w-16">#</th>
                                            <th className="p-4 text-xs font-semibold text-slate-400">Student Name</th>
                                            <th className="p-4 text-xs font-semibold text-slate-400">Roll Number</th>
                                            <th className="p-4 text-xs font-semibold text-slate-400">Check-in Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {session.attendees?.length > 0 ? (
                                            session.attendees.map((att: any, idx: number) => (
                                                <tr key={att.id} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="p-4 text-sm text-slate-500">{idx + 1}</td>
                                                    <td className="p-4 text-sm font-medium text-slate-200">{att.studentName}</td>
                                                    <td className="p-4 text-sm text-cyan-400 font-mono">{att.rollNumber}</td>
                                                    <td className="p-4 text-sm text-slate-400">
                                                        {new Date(att.timestamp).toLocaleTimeString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-12 text-center">
                                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-3 text-slate-500">
                                                        <FaUsers />
                                                    </div>
                                                    <p className="text-sm text-slate-400">Waiting for students to check in...</p>
                                                </td>
                                            </tr>
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
