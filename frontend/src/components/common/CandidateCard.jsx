import React from 'react';
import { UserCheck, Award, Eye, MessageSquare, CheckCircle, Video, Star } from 'lucide-react';

export default function CandidateCard({ candidate, onQuickView, onInquiry }) {
    const photoUrl = candidate.profile_photo_url || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80`;

    return (
        <div className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between group">

            {/* Header Photo & Badges */}
            <div className="relative h-64 overflow-hidden bg-slate-900">
                <img
                    src={photoUrl}
                    alt={`${candidate.first_name} ${candidate.last_name}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                {/* Featured Ribbon */}
                {candidate.is_featured && (
                    <div className="absolute top-3 left-3 bg-ethiopia-gold text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>Featured Candidate</span>
                    </div>
                )}

                {/* Medical Clearance Badge */}
                {candidate.medical_status === 'cleared' && (
                    <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <CheckCircle className="w-3 h-3" />
                        <span>Medical Cleared</span>
                    </div>
                )}

                {/* Candidate Code & Category */}
                <div className="absolute bottom-3 left-4 right-4">
                    <div className="text-[11px] font-semibold tracking-wider text-ethiopia-gold uppercase mb-1">
                        {candidate.category_name || 'Housemaid & Nanny'} • ID: #{candidate.id?.substring(0, 8)}
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight">
                        {candidate.first_name} {candidate.last_name}
                    </h3>
                </div>
            </div>

            {/* Profile Details & Metadata */}
            <div className="p-5 space-y-4">

                {/* Info Matrix */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                        <div className="text-slate-400 text-[10px] uppercase font-medium">Age</div>
                        <div className="font-semibold text-slate-200 mt-0.5">{candidate.age || 24} Yrs</div>
                    </div>
                    <div className="border-x border-slate-800">
                        <div className="text-slate-400 text-[10px] uppercase font-medium">Experience</div>
                        <div className="font-semibold text-slate-200 mt-0.5">{candidate.years_experience || 3} Yrs</div>
                    </div>
                    <div>
                        <div className="text-slate-400 text-[10px] uppercase font-medium">Religion</div>
                        <div className="font-semibold text-slate-200 mt-0.5 capitalize">{candidate.religion || 'Christian'}</div>
                    </div>
                </div>

                {/* Skills & Languages */}
                <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-400 font-medium">Key Skills:</div>
                    <div className="flex flex-wrap gap-1.5">
                        {(candidate.skills?.length ? candidate.skills : ['Cooking', 'Babysitting', 'House Cleaning']).map((skill, idx) => (
                            <span key={idx} className="bg-slate-900 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-800">
                                {typeof skill === 'string' ? skill : skill.skill_name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Agency Tag */}
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-900">
                    <Award className="w-3.5 h-3.5 text-ethiopia-gold shrink-0" />
                    <span className="truncate">Agency: <strong className="text-slate-300">{candidate.agency_name || 'Ethio-Dubai Agency'}</strong></span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                        onClick={() => onQuickView(candidate)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <Eye className="w-3.5 h-3.5 text-ethiopia-gold" />
                        <span>Full Profile</span>
                    </button>
                    <button
                        onClick={() => onInquiry(candidate)}
                        className="w-full py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1.5 transition-all"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Inquire Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
