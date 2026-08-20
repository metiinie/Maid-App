import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, X, Award, Eye, MessageSquare, ShieldCheck, CheckCircle } from 'lucide-react';
import CandidateCard from '../../components/common/CandidateCard';
import InquiryModal from '../../components/common/InquiryModal';
import { candidateService } from '../../services/candidateService';

export default function CandidateSearch() {
    const [candidates, setCandidates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        category_id: '',
        agency_id: '',
        gender: '',
        religion: '',
        min_age: '',
        max_age: '',
        min_experience: ''
    });

    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [detailCandidate, setDetailCandidate] = useState(null);
    const [isInquiryOpen, setIsInquiryOpen] = useState(false);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const res = await candidateService.getPublicCandidates(activeFilters);
            setCandidates(res.data || []);
        } catch (err) {
            console.error('Failed to fetch candidates:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function loadCatalogs() {
            try {
                const [catRes, agencyRes] = await Promise.all([
                    candidateService.getCategories(),
                    candidateService.getAgencies()
                ]);
                setCategories(catRes.data || []);
                setAgencies(agencyRes.data || []);
            } catch (err) {
                console.error('Failed to load catalogs:', err);
            }
        }
        loadCatalogs();
    }, []);

    useEffect(() => {
        fetchCandidates();
    }, [filters]);

    const handleInquiry = (candidate) => {
        setSelectedCandidate(candidate);
        setIsInquiryOpen(true);
    };

    const handleQuickView = async (candidate) => {
        try {
            const res = await candidateService.getCandidateDetails(candidate.id);
            setDetailCandidate(res.data);
        } catch (err) {
            setDetailCandidate(candidate);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header Banner */}
            <div>
                <h1 className="text-3xl font-extrabold text-white">Verified Candidates Directory</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Browse Ministry-screened Ethiopian workers available for immediate deployment to Middle East employers.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Filters Sidebar */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="glass-panel p-5 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2 font-bold text-sm text-white">
                                <Filter className="w-4 h-4 text-ethiopia-gold" />
                                <span>Search Filters</span>
                            </div>
                            <button
                                onClick={() => setFilters({ search: '', category_id: '', agency_id: '', gender: '', religion: '', min_age: '', max_age: '', min_experience: '' })}
                                className="text-[11px] text-ethiopia-gold hover:underline"
                            >
                                Reset All
                            </button>
                        </div>

                        {/* Keyword Search */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Search Candidate</label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    placeholder="Name, skills, ID..."
                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-ethiopia-gold"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                            <select
                                value={filters.category_id}
                                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-ethiopia-gold"
                            >
                                <option value="">All Job Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Agency Filter */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Recruitment Agency</label>
                            <select
                                value={filters.agency_id}
                                onChange={(e) => setFilters({ ...filters, agency_id: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-ethiopia-gold"
                            >
                                <option value="">All Verified Agencies</option>
                                {agencies.map((agency) => (
                                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Gender Filter */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                            <select
                                value={filters.gender}
                                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-ethiopia-gold"
                            >
                                <option value="">All Genders</option>
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                            </select>
                        </div>

                        {/* Religion Filter */}
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Religion</label>
                            <select
                                value={filters.religion}
                                onChange={(e) => setFilters({ ...filters, religion: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-ethiopia-gold"
                            >
                                <option value="">All Religions</option>
                                <option value="christian">Christian</option>
                                <option value="muslim">Muslim</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Candidate Cards Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Showing <strong className="text-white">{candidates.length}</strong> available candidates</span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <div key={n} className="h-96 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
                            ))}
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                            <Users className="w-10 h-10 text-slate-600 mx-auto" />
                            <h3 className="text-lg font-bold text-white">No Candidates Found</h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                No candidates match your current filter parameters. Try expanding your search or resetting filters.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {candidates.map((candidate) => (
                                <CandidateCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    onQuickView={handleQuickView}
                                    onInquiry={handleInquiry}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Candidate Full Profile Detail Modal */}
            {detailCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
                        <button
                            onClick={() => setDetailCandidate(null)}
                            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <img
                                src={detailCandidate.profile_photo_url || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80`}
                                alt={detailCandidate.first_name}
                                className="w-32 h-40 object-cover rounded-2xl bg-slate-950 border border-slate-800 shrink-0"
                            />
                            <div className="space-y-2 flex-1">
                                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-ethiopia-gold/10 text-ethiopia-gold border border-ethiopia-gold/20">
                                    {detailCandidate.category_name || 'Housemaid'}
                                </span>
                                <h2 className="text-2xl font-bold text-white">{detailCandidate.first_name} {detailCandidate.last_name}</h2>
                                <div className="text-xs text-slate-400">
                                    Passport: <strong className="text-slate-200">{detailCandidate.passport_number || 'EP9876543'}</strong> • Medical: <span className="text-emerald-400 font-semibold">{detailCandidate.medical_status}</span>
                                </div>
                                <div className="text-xs text-slate-400">
                                    Agency: <strong className="text-ethiopia-gold">{detailCandidate.agency_name}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Video Preview */}
                        {detailCandidate.intro_video_url && (
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-white">Video Self-Introduction</div>
                                <video src={detailCandidate.intro_video_url} controls className="w-full h-56 rounded-2xl bg-slate-950 border border-slate-800" />
                            </div>
                        )}

                        {/* Bio & Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800">
                            <div>
                                <div className="text-slate-400 text-[10px]">Age</div>
                                <div className="font-bold text-white mt-0.5">{detailCandidate.age || 25} Yrs</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-[10px]">Experience</div>
                                <div className="font-bold text-white mt-0.5">{detailCandidate.years_experience || 3} Yrs</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-[10px]">Education</div>
                                <div className="font-bold text-white mt-0.5 capitalize">{detailCandidate.education_level || 'Secondary'}</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-[10px]">Marital Status</div>
                                <div className="font-bold text-white mt-0.5 capitalize">{detailCandidate.marital_status || 'Single'}</div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    setDetailCandidate(null);
                                    handleInquiry(detailCandidate);
                                }}
                                className="w-full py-3.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-sm shadow-lg hover:brightness-110 flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Submit Inquiry Request for Candidate</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inquiry Modal */}
            <InquiryModal
                candidate={selectedCandidate}
                isOpen={isInquiryOpen}
                onClose={() => setIsInquiryOpen(false)}
            />
        </div>
    );
}
