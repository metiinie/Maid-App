import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Phone, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [phone, setPhone] = useState('+251911223344');
    const [email, setEmail] = useState('admin@ethiodubai.et');
    const [password, setPassword] = useState('Password123!');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { loginUser, loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isAdminMode) {
                await loginAdmin(email, password);
                navigate('/admin/dashboard');
            } else {
                await loginUser(phone, password);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-12 px-4">
            <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-2xl border border-slate-800">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center mx-auto shadow-lg shadow-ethiopia-gold/20">
                        <ShieldCheck className="w-7 h-7 text-slate-950 stroke-[2.5]" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">
                        {isAdminMode ? 'Agency Admin Login' : 'Sign In to EthioRecruit'}
                    </h2>
                    <p className="text-xs text-slate-400">
                        {isAdminMode ? 'Access your recruitment SaaS control panel' : 'Manage candidate inquiries, applications, & deployment tracking'}
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setIsAdminMode(false)}
                        className={`flex-1 py-2 rounded-lg transition-colors ${!isAdminMode ? 'gold-gradient-bg text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                        User / Employer Portal
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsAdminMode(true)}
                        className={`flex-1 py-2 rounded-lg transition-colors ${isAdminMode ? 'gold-gradient-bg text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                        Agency Admin SaaS
                    </button>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-ethiopia-crimson/10 border border-ethiopia-crimson/30 text-ethiopia-crimson text-xs font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isAdminMode ? (
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (International Format)</label>
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
                    ) : (
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Agency Admin Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@agency.et"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-ethiopia-gold text-xs text-white focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-ethiopia-gold text-xs text-white focus:outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        <span>{loading ? 'Authenticating...' : 'Sign In Now'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="text-center text-xs text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-ethiopia-gold font-bold hover:underline">
                        Register for free
                    </Link>
                </div>
            </div>
        </div>
    );
}
