'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
        rollNumber: '',
        cohort: 'TE-IT'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const availableCohorts = ['FE-GEN', 'SE-IT', 'TE-IT', 'BE-IT', 'SE-CS', 'TE-CS', 'BE-CS', 'SE-EXTC', 'TE-EXTC', 'BE-EXTC', 'General'];

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                rollNumber: formData.role === 'STUDENT' ? formData.rollNumber : null,
                cohort: formData.role === 'STUDENT' ? formData.cohort : null
            };

            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok) {
                // Save user globally
                localStorage.setItem('attendlink_user', JSON.stringify(data));
                
                if (data.role === 'STUDENT') {
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
                setError(data.error || 'Signup failed');
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
                    Create your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#131b2e] py-8 px-4 shadow-[0_0_20px_rgba(6,182,212,0.1)] sm:rounded-2xl sm:px-10 border border-cyan-500/20 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-[60px]" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px]" />
                    
                    <form className="space-y-5 relative z-10" onSubmit={handleSignup}>
                        {error && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</div>}
                        
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input type="radio" checked={formData.role === 'STUDENT'} onChange={() => setFormData({...formData, role: 'STUDENT'})} className="text-cyan-500 focus:ring-cyan-500 bg-[#0a0f1c] border-slate-700" />
                                Student
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input type="radio" checked={formData.role === 'PROFESSOR'} onChange={() => setFormData({...formData, role: 'PROFESSOR'})} className="text-cyan-500 focus:ring-cyan-500 bg-[#0a0f1c] border-slate-700" />
                                Professor
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Full Name</label>
                            <input type="text" required className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-[#0a0f1c] text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Email address</label>
                            <input type="email" required className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-[#0a0f1c] text-white" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Password</label>
                            <input type="password" required className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-[#0a0f1c] text-white" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>

                        {formData.role === 'STUDENT' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300">Roll Number</label>
                                    <input type="text" required className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-[#0a0f1c] text-white" value={formData.rollNumber} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300">Target Class (Cohort)</label>
                                    <select className="mt-1 block w-full px-4 py-3 border border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm bg-[#0a0f1c] text-white" value={formData.cohort} onChange={(e) => setFormData({...formData, cohort: e.target.value})}>
                                        {availableCohorts.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg shadow-cyan-500/20 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-[#131b2e] transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating account...' : 'Sign up'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center relative z-10">
                        <p className="text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
