'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle, FaSpinner, FaArrowLeft } from 'react-icons/fa';

export default function StudentSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const resolvedParams = use(params);
    const sessionId = resolvedParams.sessionId;
    
    const [session, setSession] = useState<any>(null);
    const [status, setStatus] = useState<'loading' | 'locating' | 'verifying' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('attendlink_user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

    const fetchSession = async () => {
        try {
            setStatus('loading');
            const res = await fetch(`/api/session/${sessionId}`);
            if (!res.ok) throw new Error('Session not found or expired');
            const data = await res.json();
            
            if (!data.isActive) throw new Error('This session has been closed');
            
            setSession(data);
            setStatus('locating');
            verifyLocation(data);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Failed to load session');
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchSession();
    }, [sessionId, user]);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // Earth radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in meters
    };

    const verifyLocation = (sessionData: any) => {
        if (!navigator.geolocation) {
            setStatus('error');
            setMessage('Geolocation is not supported by your device.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const distance = calculateDistance(
                    latitude, longitude,
                    sessionData.latitude, sessionData.longitude
                );

                if (distance > sessionData.radius) {
                    setStatus('error');
                    setMessage(`You are out of range. Distance: ${Math.round(distance)}m (Required: <${sessionData.radius}m)`);
                    return;
                }

                markAttendance(latitude, longitude);
            },
            (err) => {
                setStatus('error');
                setMessage(`Location error: ${err.message}. Please enable GPS permissions.`);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const markAttendance = async (lat: number, lng: number) => {
        setStatus('verifying');
        
        try {
            const deviceId = localStorage.getItem('attendlink_device_id') || 'unknown';
            
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sessionId,
                    studentName: user.name,
                    rollNumber: user.rollNumber,
                    latitude: lat,
                    longitude: lng,
                    deviceFingerprint: deviceId
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                setStatus('success');
                setMessage('Attendance marked successfully!');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to mark attendance');
            }
        } catch (err: any) {
            setStatus('error');
            setMessage('Network error while marking attendance.');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4 font-sans text-slate-200 selection:bg-cyan-500/30">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="w-full max-w-md bg-[#131b2e] border border-slate-800 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.1)] p-8 relative z-10 overflow-hidden">
                <Link href="/student" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-8">
                    <FaArrowLeft /> Back to Dashboard
                </Link>

                <div className="text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <FaSpinner className="text-4xl text-cyan-400 animate-spin mb-4" />
                            <h2 className="text-xl font-semibold text-white">Loading Session...</h2>
                        </div>
                    )}

                    {status === 'locating' && (
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <FaMapMarkerAlt className="text-5xl text-cyan-400 mb-4 relative z-10" />
                                <span className="absolute top-0 left-0 w-full h-full bg-cyan-400 rounded-full blur-md animate-ping opacity-50"></span>
                            </div>
                            <h2 className="text-xl font-semibold text-white">Acquiring GPS Signal...</h2>
                            <p className="text-sm text-slate-400 mt-2">Checking if you are within the classroom geofence.</p>
                        </div>
                    )}

                    {status === 'verifying' && (
                        <div className="flex flex-col items-center">
                            <FaSpinner className="text-4xl text-blue-400 animate-spin mb-4" />
                            <h2 className="text-xl font-semibold text-white">Verifying Identity...</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <FaCheckCircle className="text-4xl text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Verified</h2>
                            <p className="text-slate-400 text-sm">{message}</p>
                            
                            <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-4 w-full text-left space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Course</span>
                                    <span className="text-white font-medium">{session?.courseCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Roll Number</span>
                                    <span className="text-cyan-400 font-mono">{user.rollNumber}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                <FaExclamationCircle className="text-4xl text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Check-in Failed</h2>
                            <p className="text-red-300 text-sm bg-red-950/30 px-4 py-3 rounded-lg border border-red-900/50 w-full">
                                {message}
                            </p>
                            
                            <button 
                                onClick={fetchSession}
                                className="mt-8 w-full py-3 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors border border-slate-700"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
