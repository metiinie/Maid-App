import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Award, CheckCircle, MessageSquare } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { useChat } from '../../context/ChatContext';

export default function AgenciesDirectory() {
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const { openChatWithAgency } = useChat();

    useEffect(() => {
        async function loadAgencies() {
            try {
                const res = await candidateService.getAgencies();
                setAgencies(res.data || []);
            } catch (err) {
                console.error('Failed to load agencies:', err);
            } finally {
                setLoading(false);
            }
        }
        loadAgencies();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-white">Verified Agency Directory</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Directory of Ministry of Labor & Skills licensed foreign employment manpower agencies in Ethiopia.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-64 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {agencies.map((agency) => (
                        <div key={agency.id} className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center font-bold text-slate-950">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Verified License</span>
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white">{agency.name}</h3>
                                    <div className="text-xs text-ethiopia-gold font-semibold mt-0.5">
                                        License #{agency.license_number || 'ET-MOL-2026-098'}
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-900">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate">{agency.city || 'Addis Ababa'}, Ethiopia</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{agency.phone || '+251 911 000000'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate">{agency.email || 'contact@agency.et'}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => openChatWithAgency(agency.id, agency.name)}
                                className="w-full py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Contact Agency</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
