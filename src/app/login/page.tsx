'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                // Save user globally
                localStorage.setItem('attendlink_user', JSON.stringify(data));
                
                if (data.role === 'STUDENT') {
                    // Update student profile backward compatibility
                    localStorage.setItem('attendlink_student_profile', JSON.stringify({
                        studentName: data.name,
                        rollNumber: data.rollNumber,
                        cohort: data.cohort
                    }));
                    router.push('/student');
                } else {
                    router.push('/professor');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-200">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">AttendLink</span>
                </Link>
                <h2 className="text-center text-2xl font-semibold tracking-tight">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#131b2e] py-8 px-4 shadow-[0_0_20px_rgba(6,182,212,0.1)] sm:rounded-2xl sm:px-10 border border-cyan-500/20 relative overflow-hidden">
                    {/* Glowing orb background effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-[60px]" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px]" />
                    
                    <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
                        {error && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</div>}
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-slate-700 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-[#0a0f1c] text-white transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-slate-700 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-[#0a0f1c] text-white transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg shadow-cyan-500/20 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-[#131b2e] transition-all disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center relative z-10">
                        <p className="text-sm text-slate-400">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
