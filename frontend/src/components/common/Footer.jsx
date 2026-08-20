import React from 'react';
import { ShieldCheck, Phone, Mail, MapPin, Globe } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg gold-gradient-bg flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                            </div>
                            <span className="font-bold text-lg text-white">Ethio<span className="gold-gradient-text">Recruit</span></span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-400">
                            The premier Ethiopian recruitment agency SaaS platform connecting Ministry-licensed manpower agencies with Middle East employers and verified candidates.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-ethiopia-gold">
                            <Globe className="w-4 h-4" />
                            <span>Ministry of Labor & Skills Compliant</span>
                        </div>
                    </div>

                    {/* Recruitment Corridors */}
                    <div>
                        <h4 className="font-semibold text-slate-200 mb-4 text-xs tracking-wider uppercase">Recruitment Corridors</h4>
                        <ul className="space-y-2 text-xs">
                            <li><span className="hover:text-white transition-colors">United Arab Emirates (Dubai / Abu Dhabi)</span></li>
                            <li><span className="hover:text-white transition-colors">Kingdom of Saudi Arabia (Riyadh / Jeddah)</span></li>
                            <li><span className="hover:text-white transition-colors">State of Qatar (Doha)</span></li>
                            <li><span className="hover:text-white transition-colors">State of Kuwait</span></li>
                            <li><span className="hover:text-white transition-colors">Sultanate of Oman</span></li>
                        </ul>
                    </div>

                    {/* Job Categories */}
                    <div>
                        <h4 className="font-semibold text-slate-200 mb-4 text-xs tracking-wider uppercase">Key Categories</h4>
                        <ul className="space-y-2 text-xs">
                            <li><span className="hover:text-white transition-colors">Domestic Housemaids & Housekeepers</span></li>
                            <li><span className="hover:text-white transition-colors">Professional Nannies & Caregivers</span></li>
                            <li><span className="hover:text-white transition-colors">Private Family Drivers & Mechanics</span></li>
                            <li><span className="hover:text-white transition-colors">Hospitality & Catering Staff</span></li>
                            <li><span className="hover:text-white transition-colors">Construction & Security Personnel</span></li>
                        </ul>
                    </div>

                    {/* Contact & Licensing */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-slate-200 mb-4 text-xs tracking-wider uppercase">Addis Ababa Head Office</h4>
                        <div className="flex items-center gap-3 text-xs">
                            <MapPin className="w-4 h-4 text-ethiopia-gold shrink-0" />
                            <span>Bole Sub-City, Commercial Building, Addis Ababa, Ethiopia</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <Phone className="w-4 h-4 text-ethiopia-gold shrink-0" />
                            <span>+251 911 000 000 / +251 116 000 000</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <Mail className="w-4 h-4 text-ethiopia-gold shrink-0" />
                            <span>support@ethiorecruit.et</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
                    <p>© {new Date().getFullYear()} EthioRecruit SaaS PLC. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="hover:text-slate-300">Privacy Policy</span>
                        <span className="hover:text-slate-300">Terms of Service</span>
                        <span className="hover:text-slate-300">Agency Portal</span>
                        <span className="hover:text-slate-300">Admin Login</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
