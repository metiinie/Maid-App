import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, Users, Briefcase, ArrowRight, CheckCircle2, Star, Globe2, Award, ChevronRight } from 'lucide-react';
import CandidateCard from '../../components/common/CandidateCard';
import VacancyCard from '../../components/common/VacancyCard';
import InquiryModal from '../../components/common/InquiryModal';
import { candidateService } from '../../services/candidateService';
import { vacancyService } from '../../services/vacancyService';

export default function Home() {
    const [featuredCandidates, setFeaturedCandidates] = useState([]);
    const [featuredVacancies, setFeaturedVacancies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isInquiryOpen, setIsInquiryOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadHomeData() {
            try {
                const [candRes, vacRes, catRes] = await Promise.all([
                    candidateService.getFeaturedCandidates(),
                    vacancyService.getFeaturedVacancies(),
                    candidateService.getCategories()
                ]);
                setFeaturedCandidates(candRes.data || []);
                setFeaturedVacancies(vacRes.data || []);
                setCategories(catRes.data || []);
            } catch (err) {
                console.error('Failed to load homepage data:', err);
            } finally {
                setLoading(false);
            }
        }
        loadHomeData();
    }, []);

    const handleInquiry = (candidate) => {
        setSelectedCandidate(candidate);
        setIsInquiryOpen(true);
    };

    return (
        <div className="space-y-24 pb-16">

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 lg:pt-20">

                {/* Glow Effects */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-ethiopia-gold/10 rounded-full blur-[140px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center space-y-6 max-w-4xl mx-auto">

                        {/* Accreditation Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-ethiopia-gold/30 text-ethiopia-gold text-xs font-semibold shadow-lg">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Ministry of Labor & Skills Approved Platform</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                            Connecting Ethiopian Talent with <span className="gold-gradient-text">Global Employers</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
                            The leading digital recruitment platform powering verified manpower agency operations across Ethiopia, Saudi Arabia, Dubai, Qatar, Kuwait, and Oman.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link
                                to="/candidates"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl gold-gradient-bg text-slate-950 font-extrabold text-sm shadow-xl shadow-ethiopia-gold/20 hover:brightness-110 flex items-center justify-center gap-3 transition-all"
                            >
                                <Users className="w-5 h-5" />
                                <span>Explore Candidates Catalog</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/vacancies"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-800 flex items-center justify-center gap-3 transition-colors"
                            >
                                <Briefcase className="w-5 h-5 text-ethiopia-gold" />
                                <span>Browse Foreign Vacancies</span>
                            </Link>
                        </div>

                        {/* Live Platform Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-900/80">
                            <div className="glass-panel p-4 rounded-2xl">
                                <div className="text-2xl font-extrabold text-white gold-gradient-text">5,000+</div>
                                <div className="text-xs text-slate-400 font-medium mt-1">Verified Candidates</div>
                            </div>
                            <div className="glass-panel p-4 rounded-2xl">
                                <div className="text-2xl font-extrabold text-white gold-gradient-text">120+</div>
                                <div className="text-xs text-slate-400 font-medium mt-1">Licensed Agencies</div>
                            </div>
                            <div className="glass-panel p-4 rounded-2xl">
                                <div className="text-2xl font-extrabold text-white gold-gradient-text">98.4%</div>
                                <div className="text-xs text-slate-400 font-medium mt-1">Deployment Success</div>
                            </div>
                            <div className="glass-panel p-4 rounded-2xl">
                                <div className="text-2xl font-extrabold text-white gold-gradient-text">6 Countries</div>
                                <div className="text-xs text-slate-400 font-medium mt-1">Gulf Recruitment Corridors</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Candidates Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold text-ethiopia-gold uppercase tracking-wider mb-1">Pre-Screened & Medical Cleared</div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured Candidates</h2>
                    </div>
                    <Link
                        to="/candidates"
                        className="text-xs font-bold text-ethiopia-gold hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <span>View All Candidates ({featuredCandidates.length})</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="h-96 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredCandidates.slice(0, 4).map((candidate) => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                                onQuickView={() => { }}
                                onInquiry={handleInquiry}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Job Categories Showcase */}
            <section className="bg-slate-950 border-y border-slate-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Recruitment Specializations</h2>
                        <p className="text-sm text-slate-400 mt-2">Comprehensive workforce deployment covering skilled, semi-skilled, and domestic sectors.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.slice(0, 6).map((cat) => (
                            <div key={cat.id} className="glass-panel p-5 rounded-2xl text-center space-y-3 hover:border-ethiopia-gold/50 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-ethiopia-gold mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-xs text-white tracking-wide">{cat.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Vacancies Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold text-ethiopia-gold uppercase tracking-wider mb-1">Foreign Employment Opportunities</div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Active Job Vacancies</h2>
                    </div>
                    <Link
                        to="/vacancies"
                        className="text-xs font-bold text-ethiopia-gold hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <span>View All Vacancies</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredVacancies.slice(0, 3).map((vacancy) => (
                        <VacancyCard
                            key={vacancy.id}
                            vacancy={vacancy}
                            onApply={() => { }}
                        />
                    ))}
                </div>
            </section>

            {/* Inquiry Modal */}
            <InquiryModal
                candidate={selectedCandidate}
                isOpen={isInquiryOpen}
                onClose={() => setIsInquiryOpen(false)}
            />
        </div>
    );
}
