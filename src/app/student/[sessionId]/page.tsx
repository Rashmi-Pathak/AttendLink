'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    FaMapMarkerAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaBroadcastTower,
    FaWifi,
    FaShieldAlt,
    FaArrowLeft,
    FaSpinner
} from 'react-icons/fa';

export default function StudentPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;

    const [status, setStatus] = useState<'idle' | 'locating' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        studentName: '',
        rollNumber: '',
    });

    const submitAttendance = async () => {
        if (!formData.studentName.trim() || !formData.rollNumber.trim()) {
            setMessage('Please enter both your full name and student roll number.');
            setStatus('error');
            return;
        }

        setStatus('locating');
        setMessage('Acquiring high-accuracy wireless coordinates from device...');

        if (!navigator.geolocation) {
            setMessage('Geolocation is not supported by your current browser.');
            setStatus('error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setStatus('submitting');
                setMessage('Validating geofence radius with AttendLink server...');

                try {
                    const res = await fetch('/api/attendance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionId: sessionId,
                            studentName: formData.studentName.trim(),
                            rollNumber: formData.rollNumber.trim().toUpperCase(),
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            deviceFingerprint: typeof window !== 'undefined' ? `${navigator.userAgent}`.slice(0, 50) : 'attendlink-client',
                        }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.error || 'Failed to verify attendance');
                    }

                    setStatus('success');
                    setMessage(`Attendance verified successfully for Roll No: ${formData.rollNumber.trim().toUpperCase()}`);
                } catch (err: any) {
                    setStatus('error');
                    setMessage(err.message || 'Verification failed');
                }
            },
            (err) => {
                setStatus('error');
                setMessage('Location access denied or timed out (' + err.message + '). Please allow location permissions in your browser settings to verify your classroom presence.');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors">
                            <FaArrowLeft className="text-sm" />
                        </Link>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                            <FaBroadcastTower className="text-sm" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-200 tracking-tight">AttendLink</span>
                            <span className="text-slate-500 text-xs ml-2 hidden sm:inline">Student Check-In</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                        <FaWifi className="text-[11px]" />
                        <span>Wireless Verification</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 sm:py-12 flex flex-col justify-center">
                {status === 'success' ? (
                    <div className="bg-slate-900/90 border border-emerald-500/30 p-8 rounded-2xl text-center shadow-2xl backdrop-blur-sm animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-3xl">
                            <FaCheckCircle />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Presence Verified!</h2>
                        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                            {message}
                        </p>
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono mb-6">
                            Session: {sessionId}
                        </div>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                        >
                            Return to Homepage
                        </Link>
                    </div>
                ) : (
                    <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-white tracking-tight">Mark Attendance</h1>
                            <p className="text-xs text-slate-400 mt-1">
                                High-precision geofencing verifies you are physically present in class.
                            </p>
                        </div>

                        {status === 'error' && (
                            <div className="mb-5 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
                                <FaExclamationTriangle className="text-rose-400 shrink-0 mt-0.5" />
                                <span>{message}</span>
                            </div>
                        )}

                        {(status === 'locating' || status === 'submitting') && (
                            <div className="mb-5 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm flex items-center gap-3">
                                <FaSpinner className="animate-spin text-indigo-400 shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Alex Johnson"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                    value={formData.studentName}
                                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                    disabled={status === 'locating' || status === 'submitting'}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Student Roll Number / ID
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 21CS045"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                    value={formData.rollNumber}
                                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                    disabled={status === 'locating' || status === 'submitting'}
                                />
                            </div>

                            <button
                                onClick={submitAttendance}
                                disabled={status === 'locating' || status === 'submitting'}
                                className="w-full py-3.5 px-6 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2 text-sm"
                            >
                                {status === 'locating' || status === 'submitting' ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        <span>Verifying Location...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaMapMarkerAlt />
                                        <span>Verify Location & Check In</span>
                                    </>
                                )}
                            </button>

                            <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                                <FaShieldAlt className="text-slate-600 text-[11px]" />
                                <span>Anti-proxy verification requires device location consent</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
                <span>AttendLink &mdash; Smart Wireless & Location-Aware Attendance System</span>
            </footer>
        </div>
    );
}
