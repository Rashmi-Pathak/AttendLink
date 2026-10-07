'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaUserGraduate, FaSave, FaExclamationTriangle, FaMapMarkerAlt, FaWifi } from 'react-icons/fa';

interface ActiveSession {
    id: string;
    professorName: string;
    courseCode: string;
    createdAt: string;
    expiresAt: string;
}

export default function StudentDashboard() {
    const [profile, setProfile] = useState({
        studentName: '',
        rollNumber: '',
        cohort: 'TE-IT'
    });
    const [isEditing, setIsEditing] = useState(true);
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [loading, setLoading] = useState(false);

    const availableCohorts = ['FE-GEN', 'SE-IT', 'TE-IT', 'BE-IT', 'SE-CS', 'TE-CS', 'BE-CS', 'SE-EXTC', 'TE-EXTC', 'BE-EXTC', 'General'];

    useEffect(() => {
        const saved = localStorage.getItem('attendlink_student_profile');
        if (saved) {
            const parsed = JSON.parse(saved);
            setProfile(parsed);
            if (parsed.studentName && parsed.rollNumber) {
                setIsEditing(false);
            }
        }
    }, []);

    const saveProfile = () => {
        if (!profile.studentName.trim() || !profile.rollNumber.trim()) {
            alert('Please enter Name and Roll Number');
            return;
        }
        localStorage.setItem('attendlink_student_profile', JSON.stringify(profile));
        setIsEditing(false);
    };

    useEffect(() => {
        if (isEditing || !profile.cohort) return;

        const fetchSessions = async () => {
            try {
                const res = await fetch(`/api/session/active?cohort=${encodeURIComponent(profile.cohort)}`);
                if (res.ok) {
                    const data = await res.json();
                    setActiveSessions(data || []);
                }
            } catch (err) {
                console.error('Failed to fetch active sessions', err);
            }
        };

        fetchSessions();
        const interval = setInterval(fetchSessions, 5000); // Polling every 5 seconds
        return () => clearInterval(interval);
    }, [isEditing, profile.cohort]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="font-bold text-slate-200 tracking-tight">AttendLink</Link>
                        <span className="text-slate-500 text-xs ml-2 hidden sm:inline">Student Dashboard</span>
                    </div>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {isEditing ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-lg mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                <FaUserGraduate />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Student Profile Setup</h2>
                                <p className="text-xs text-slate-400">Enter your details to discover live sessions.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    value={profile.studentName}
                                    onChange={(e) => setProfile({ ...profile, studentName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Roll Number</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    value={profile.rollNumber}
                                    onChange={(e) => setProfile({ ...profile, rollNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Your Class (Cohort)</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    value={profile.cohort}
                                    onChange={(e) => setProfile({ ...profile, cohort: e.target.value })}
                                >
                                    {availableCohorts.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={saveProfile}
                                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <FaSave /> Save Profile & Enter Dashboard
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">Welcome, {profile.studentName}</h1>
                                <p className="text-sm text-slate-400">Class: <span className="font-semibold text-slate-300">{profile.cohort}</span> | Roll: {profile.rollNumber}</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Listening for sessions...
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FaWifi className="text-indigo-400" /> Live Attendance Sessions
                            </h2>

                            {activeSessions.length === 0 ? (
                                <div className="border border-dashed border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-4">
                                        <FaExclamationTriangle className="text-2xl" />
                                    </div>
                                    <h3 className="text-slate-300 font-medium text-lg">No active sessions</h3>
                                    <p className="text-slate-500 text-sm mt-1 max-w-sm">
                                        Your instructor hasn't started a session for <strong>{profile.cohort}</strong> yet, or the session has expired.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeSessions.map((session) => (
                                        <div key={session.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                                            <div className="absolute top-0 right-0 p-3">
                                                <span className="flex h-3 w-3 relative">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-1">{session.courseCode}</h3>
                                            <p className="text-sm text-slate-400 mb-4">Instructor: {session.professorName}</p>
                                            
                                            <Link 
                                                href={`/student/${session.id}`}
                                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FaMapMarkerAlt /> Mark Yours Now
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
