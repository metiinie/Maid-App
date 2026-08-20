import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Phone, Lock, User, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';

export default function Register() {
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify & Register
    const [phone, setPhone] = useState('+251911998877');
    const [otpCode, setOtpCode] = useState('123456');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employer'); // employer or jobseeker

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await authService.requestOtp(phone, 'registration');
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to send OTP code.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await authService.verifyOtp(phone, otpCode, 'registration');
            await authService.registerUser({
                phone,
                password,
                first_name: firstName,
                last_name: lastName,
                email,
                role
            });
            alert('Registration successful! Please sign in.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-12 px-4">
            <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-2xl border border-slate-800">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center mx-auto shadow-lg shadow-ethiopia-gold/20">
                        <ShieldCheck className="w-7 h-7 text-slate-950 stroke-[2.5]" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">Create Verified Account</h2>
                    <p className="text-xs text-slate-400">Step {step} of 2: {step === 1 ? 'Phone SMS Verification' : 'Profile Credentials'}</p>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-ethiopia-crimson/10 border border-ethiopia-crimson/30 text-ethiopia-crimson text-xs font-medium">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (SMS OTP)</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+251 911 000000"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-ethiopia-gold text-xs text-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            <span>{loading ? 'Sending Code...' : 'Send Verification OTP'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Enter 6-Digit OTP Code (Test: 123456)</label>
                            <input
                                type="text"
                                required
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder="123456"
                                className="w-full text-center tracking-widest text-lg font-mono px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-ethiopia-gold text-white focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="e.g. Almaz"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="e.g. Tesfaye"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Account Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                            >
                                <option value="employer">Employer / Family Representative</option>
                                <option value="jobseeker">Jobseeker / Candidate</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Create Password *</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            <span>{loading ? 'Registering...' : 'Complete Registration'}</span>
                            <CheckCircle2 className="w-4 h-4" />
                        </button>
                    </form>
                )}

                <div className="text-center text-xs text-slate-400">
                    Already registered?{' '}
                    <Link to="/login" className="text-ethiopia-gold font-bold hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
