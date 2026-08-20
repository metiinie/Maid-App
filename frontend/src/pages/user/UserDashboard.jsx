import React, { useState, useEffect } from 'react';
import { Briefcase, MessageSquare, CheckCircle, Clock, FileText, Download, ShieldCheck } from 'lucide-react';
import { vacancyService } from '../../services/vacancyService';
import { pipelineService } from '../../services/pipelineService';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export default function UserDashboard() {
    const { user } = useAuth();
    const { openChatWithAgency } = useChat();
    const [activeTab, setActiveTab] = useState('applications'); // applications or pipelines
    const [applications, setApplications] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUserData() {
            try {
                const [appRes, pipeRes] = await Promise.all([
                    vacancyService.getUserApplications(),
                    pipelineService.getUserPipelines()
                ]);
                setApplications(appRes.data || []);
                setPipelines(pipeRes.data || []);
            } catch (err) {
                console.error('Failed to load user dashboard:', err);
            } finally {
                setLoading(false);
            }
        }
        loadUserData();
    }, []);

    const stages = [
        { key: 'interviewing', label: 'Interviewing' },
        { key: 'medical_biometrics', label: 'Medical & Biometrics' },
        { key: 'visa_processing', label: 'Visa Processing' },
        { key: 'pre_departure_training', label: 'Training' },
        { key: 'deployed', label: 'Deployed' }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-bold text-ethiopia-gold uppercase tracking-wider">User Portal</span>
                    <h1 className="text-2xl font-extrabold text-white">Welcome, {user?.first_name} {user?.last_name}</h1>
                    <p className="text-xs text-slate-400 mt-0.5">Phone: {user?.phone} • Role: {user?.role}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit text-xs font-semibold">
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`px-5 py-2.5 rounded-xl transition-colors ${activeTab === 'applications' ? 'gold-gradient-bg text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    My Job Applications ({applications.length})
                </button>
                <button
                    onClick={() => setActiveTab('pipelines')}
                    className={`px-5 py-2.5 rounded-xl transition-colors ${activeTab === 'pipelines' ? 'gold-gradient-bg text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    Hiring & Deployment Pipelines ({pipelines.length})
                </button>
            </div>

            {loading ? (
                <div className="h-64 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
            ) : activeTab === 'applications' ? (
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">Application History</h3>
                    {applications.length === 0 ? (
                        <div className="text-center py-12 text-xs text-slate-400">No job applications submitted yet.</div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {applications.map((app) => (
                                <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{app.vacancy_title}</h4>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            Agency: <strong className="text-ethiopia-gold">{app.agency_name}</strong> • Applied {new Date(app.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[11px] font-bold uppercase px-3 py-1 rounded-full ${app.status === 'selected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                app.status === 'rejected' ? 'bg-ethiopia-crimson/20 text-ethiopia-crimson border border-ethiopia-crimson/30' :
                                                    'bg-ethiopia-gold/20 text-ethiopia-gold border border-ethiopia-gold/30'
                                            }`}>
                                            {app.status}
                                        </span>
                                        <button
                                            onClick={() => openChatWithAgency(app.agency_id, app.agency_name, 'vacancy_application', app.id)}
                                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 text-ethiopia-gold" />
                                            <span>Chat Agency</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {pipelines.length === 0 ? (
                        <div className="glass-panel p-12 text-center text-xs text-slate-400 rounded-2xl">
                            No active recruitment pipelines.
                        </div>
                    ) : (
                        pipelines.map((pipe) => (
                            <div key={pipe.id} className="glass-panel p-6 rounded-2xl space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-ethiopia-gold uppercase">Deployment Pipeline #{pipe.id?.substring(0, 8)}</span>
                                        <h3 className="text-xl font-bold text-white">Candidate: {pipe.candidate_name || 'Almaz Tesfaye'}</h3>
                                        <p className="text-xs text-slate-400">Employer: {pipe.employer_name} • Agency: {pipe.agency_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                            Outcome: {pipe.outcome || 'in_progress'}
                                        </span>
                                    </div>
                                </div>

                                {/* 5-Stage Stepper */}
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold text-slate-300">Deployment Lifecycle Stage Progress</div>
                                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                                        {stages.map((stg, idx) => {
                                            const isCurrent = pipe.current_stage === stg.key;
                                            return (
                                                <div key={stg.key} className={`p-3 rounded-xl border text-[11px] font-bold transition-colors ${isCurrent ? 'gold-gradient-bg text-slate-950 border-ethiopia-gold' : 'bg-slate-950 text-slate-400 border-slate-800'
                                                    }`}>
                                                    <div className="text-[9px] opacity-70">Step 0{idx + 1}</div>
                                                    <div className="truncate mt-0.5">{stg.label}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
