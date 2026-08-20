import React from 'react';
import { MapPin, DollarSign, Clock, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export default function VacancyCard({ vacancy, onApply }) {
    return (
        <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between group">
            <div className="space-y-4">

                {/* Header Tag & Agency */}
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-ethiopia-gold/10 text-ethiopia-gold border border-ethiopia-gold/20">
                        {vacancy.target_country || 'United Arab Emirates'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                        Posted {new Date(vacancy.created_at || Date.now()).toLocaleDateString()}
                    </span>
                </div>

                {/* Job Title & Agency */}
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-ethiopia-gold transition-colors leading-tight">
                        {vacancy.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <ShieldCheck className="w-4 h-4 text-ethiopia-gold shrink-0" />
                        <span className="font-medium text-slate-300">{vacancy.agency_name || 'Verified Partner Agency'}</span>
                    </div>
                </div>

                {/* Job Info Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                        <DollarSign className="w-4 h-4 text-ethiopia-gold shrink-0" />
                        <span>Salary: <strong className="text-white">{vacancy.salary_monthly} {vacancy.currency || 'AED'}</strong>/mo</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-ethiopia-gold shrink-0" />
                        <span className="capitalize">{vacancy.contract_type?.replace('_', ' ') || '2 Years Contract'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                        <Users className="w-4 h-4 text-ethiopia-gold shrink-0" />
                        <span className="capitalize">Gender: {vacancy.gender_preference || 'Any'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-ethiopia-gold shrink-0" />
                        <span>{vacancy.city || vacancy.target_country || 'Dubai'}</span>
                    </div>
                </div>

                {/* Description snippet */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {vacancy.description || 'Seeking experienced, reliable personnel for full-time employment with accommodation and medical benefits provided.'}
                </p>
            </div>

            {/* Apply Button */}
            <div className="pt-6">
                <button
                    onClick={() => onApply(vacancy)}
                    className="w-full py-3 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-lg shadow-ethiopia-gold/15 hover:brightness-110 flex items-center justify-center gap-2 transition-all"
                >
                    <span>Apply For Vacancy</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
