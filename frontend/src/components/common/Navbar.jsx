import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, Briefcase, Users, MessageSquare, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export default function Navbar() {
    const { user, admin, logoutUser, logoutAdmin } = useAuth();
    const { unreadNotifsCount, openChatWithAgency } = useChat();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center shadow-lg shadow-ethiopia-gold/20 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xl tracking-tight text-white">Ethio<span className="gold-gradient-text">Recruit</span></span>
                            <span className="text-[10px] font-semibold tracking-widest uppercase bg-ethiopia-gold/10 text-ethiopia-gold px-2 py-0.5 rounded border border-ethiopia-gold/20">SaaS</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium tracking-wide">Ethiopian Global Recruitment Platform</p>
                    </div>
                </Link>

                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                    <Link to="/" className="hover:text-ethiopia-gold transition-colors flex items-center gap-2">
                        <span>Home</span>
                    </Link>
                    <Link to="/candidates" className="hover:text-ethiopia-gold transition-colors flex items-center gap-2">
                        <Users className="w-4 h-4 text-ethiopia-gold" />
                        <span>Candidates Catalog</span>
                    </Link>
                    <Link to="/vacancies" className="hover:text-ethiopia-gold transition-colors flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-ethiopia-gold" />
                        <span>Job Vacancies</span>
                    </Link>
                    <Link to="/agencies" className="hover:text-ethiopia-gold transition-colors flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-ethiopia-gold" />
                        <span>Agencies</span>
                    </Link>
                </nav>

                {/* Right Auth & Action Controls */}
                <div className="flex items-center gap-4">

                    {/* Notifications Button */}
                    {(user || admin) && (
                        <button
                            onClick={() => navigate(admin ? '/admin/dashboard' : '/dashboard')}
                            className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                            title="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadNotifsCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-ethiopia-crimson text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                    {unreadNotifsCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* User Logged In */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-ethiopia-gold/40 text-sm font-medium text-slate-200 transition-colors"
                            >
                                <div className="w-7 h-7 rounded-full bg-ethiopia-gold/20 text-ethiopia-gold flex items-center justify-center font-bold text-xs">
                                    {user.first_name?.[0] || 'U'}
                                </div>
                                <span>{user.first_name} {user.last_name}</span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                                    >
                                        <User className="w-4 h-4 text-ethiopia-gold" />
                                        <span>My Dashboard & Applications</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logoutUser();
                                            setDropdownOpen(false);
                                            navigate('/');
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-ethiopia-crimson hover:bg-slate-800"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Logged In */}
                    {admin && !user && (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/admin/dashboard"
                                className="px-4 py-2 rounded-xl gold-gradient-bg text-slate-950 font-semibold text-sm shadow-md hover:brightness-110 transition-all flex items-center gap-2"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Agency Dashboard</span>
                            </Link>
                        </div>
                    )}

                    {/* Guest Auth Buttons */}
                    {!user && !admin && (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 rounded-xl gold-gradient-bg text-slate-950 font-bold text-sm shadow-lg shadow-ethiopia-gold/20 hover:brightness-110 transition-all"
                            >
                                Register Free
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
