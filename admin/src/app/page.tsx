import React from 'react';
import { Users, Briefcase, GitPullRequest, MessageSquare, Plus, ArrowUpRight } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar + Main Content Shell */}
            <div className="flex">
                {/* Navigation Sidebar */}
                <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white text-lg">
                                E
                            </div>
                            <div>
                                <h1 className="font-bold text-base leading-tight">EthioRecruit</h1>
                                <p className="text-xs text-slate-400">Admin Portal v2.0</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500 text-white font-medium text-sm"
                            >
                                <Users className="w-4 h-4" />
                                Candidates
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium text-sm transition"
                            >
                                <Briefcase className="w-4 h-4 text-blue-400" />
                                Vacancies
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium text-sm transition"
                            >
                                <GitPullRequest className="w-4 h-4 text-emerald-400" />
                                Hiring Pipeline
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium text-sm transition"
                            >
                                <MessageSquare className="w-4 h-4 text-amber-400" />
                                Inquiries & Chat
                            </a>
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-slate-800 text-xs text-slate-400">
                        Agency ID: <span className="text-slate-200 font-mono">addis-recruitment</span>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-8">
                    <header className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                            <p className="text-slate-500 text-sm">
                                Manage candidate profiles, job postings, and international deployment pipelines.
                            </p>
                        </div>
                        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition shadow-sm">
                            <Plus className="w-4 h-4" />
                            Add New Candidate
                        </button>
                    </header>

                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                    Total Candidates
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">142</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>+12 added this week</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                    Active Vacancies
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Briefcase className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">28</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                                <span>Middle East Corridor</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                    In Deployment
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <GitPullRequest className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">19</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                <span>Visa & Biometrics processing</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                    New Inquiries
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">8</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                                <span>Requires admin response</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
