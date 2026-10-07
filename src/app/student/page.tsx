'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUserGraduate, FaSignOutAlt, FaExclamationTriangle, FaMapMarkerAlt, FaWifi, FaBook } from 'react-icons/fa';

interface ActiveSession {
    id: string;
    professorName: string;
    courseCode: string;
    createdAt: string;
    expiresAt: string;
}

export default function StudentDashboard() {
    const [user, setUser] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [stats, setStats] = useState({ percentage: 100, attended: 0, totalSessions: 0 });
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('attendlink_user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));

        // Generate device ID for fingerprinting if it doesn't exist
        let deviceId = localStorage.getItem('attendlink_device_id');
        if (!deviceId) {
            deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
            localStorage.setItem('attendlink_device_id', deviceId);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('attendlink_user');
        localStorage.removeItem('attendlink_student_profile');
        router.push('/login');
    };

    useEffect(() => {
        if (!user || !user.cohort || !user.rollNumber) return;

        const fetchInitialData = async () => {
            try {
                // Fetch Cohort Courses
                const resCourses = await fetch(`/api/courses?cohort=${encodeURIComponent(user.cohort)}`);
                if (resCourses.ok) {
                    const data = await resCourses.json();
                    setCourses(data || []);
                }
            } catch (err) {
                console.error('Failed to fetch courses', err);
            }
        };

        fetchInitialData();
    }, [user]);

    useEffect(() => {
        if (!user || !user.cohort || !user.rollNumber) return;

        const fetchDynamicData = async () => {
            try {
                // Fetch Active Sessions
                const resSessions = await fetch(`/api/session/active?cohort=${encodeURIComponent(user.cohort)}`);
                if (resSessions.ok) {
                    const data = await resSessions.json();
                    setActiveSessions(data || []);
                }

                // Fetch Attendance Stats
                const resStats = await fetch(`/api/student/stats?rollNumber=${encodeURIComponent(user.rollNumber)}&cohort=${encodeURIComponent(user.cohort)}`);
                if (resStats.ok) {
                    const statsData = await resStats.json();
                    if(!statsData.error) setStats(statsData);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard dynamic data', err);
            }
        };

        fetchDynamicData();
        const interval = setInterval(fetchDynamicData, 5000); // Polling every 5 seconds
        return () => clearInterval(interval);
    }, [user]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-white pb-20">
            <header className="border-b border-slate-800 bg-[#0a0f1c]/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight text-xl">AttendLink</Link>
                        <span className="text-slate-500 text-xs ml-2 hidden sm:inline uppercase tracking-wider font-semibold">Student Dashboard</span>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="text-xs font-semibold uppercase px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-full transition-all flex items-center gap-2"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-8 relative">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Welcome, {user.name}</h1>
                                <p className="text-sm text-slate-400 mt-1">
                                    Class: <span className="text-cyan-400 font-semibold">{user.cohort}</span> | Roll: {user.rollNumber}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-semibold uppercase">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                Monitoring Sessions...
                            </div>
                        </div>
                        
                        {/* Attendance Stats Tracker */}
                        <div className={`border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center text-center relative z-10 transition-colors ${stats.percentage >= 75 ? 'bg-[#131b2e]' : 'bg-red-950/20 border-red-500/30'}`}>
                            <h3 className="text-xs font-semibold uppercase text-slate-400 mb-1">My Attendance</h3>
                            <div className={`text-4xl font-bold ${stats.percentage >= 75 ? 'text-cyan-400' : 'text-red-400'}`}>
                                {stats.percentage}%
                            </div>
                            <p className="text-xs text-slate-500 mt-2 font-medium">
                                {stats.attended} / {stats.totalSessions} Sessions
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 mt-10">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20"><FaBook className="text-blue-400" /></span> 
                                My Subjects ({user.cohort})
                            </h2>
                        </div>

                        {courses.length === 0 ? (
                            <div className="border border-dashed border-slate-700 bg-slate-900/50 rounded-2xl p-10 flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
                                    <FaExclamationTriangle className="text-2xl" />
                                </div>
                                <h3 className="text-slate-300 font-semibold text-lg">No subjects found</h3>
                                <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
                                    Instructors have not created any subjects for your class yet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courses.map((course) => {
                                    const activeSession = activeSessions.find(s => s.courseCode === course.name);
                                    
                                    return (
                                        <div key={course.id} className={`border rounded-2xl p-6 shadow-xl relative overflow-hidden transition-colors ${activeSession ? 'bg-[#131b2e] border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-[#0f172a] border-slate-800'}`}>
                                            {activeSession && (
                                                <div className="absolute top-0 right-0 p-4">
                                                    <span className="flex h-3 w-3 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-blue-400 border border-slate-700">
                                                    <FaBook />
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
                                            <p className="text-sm text-slate-400 mb-6">Instructor: {course.professor?.name || 'Unknown'}</p>
                                            
                                            {activeSession ? (
                                                <Link 
                                                    href={`/student/${activeSession.id}`}
                                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FaMapMarkerAlt /> Live: Mark Attendance
                                                </Link>
                                            ) : (
                                                <button disabled className="w-full bg-slate-800/50 text-slate-500 border border-slate-700/50 text-sm font-semibold py-3 rounded-xl cursor-not-allowed">
                                                    No Active Session
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
