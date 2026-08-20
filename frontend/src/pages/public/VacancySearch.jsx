import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import VacancyCard from '../../components/common/VacancyCard';
import { vacancyService } from '../../services/vacancyService';
import { useAuth } from '../../context/AuthContext';

export default function VacancySearch() {
    const { user } = useAuth();
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        country: '',
        contract_type: ''
    });
    const [appliedVacancy, setAppliedVacancy] = useState(null);
    const [applying, setApplying] = useState(false);
    const [appliedSuccess, setAppliedSuccess] = useState(false);

    const fetchVacancies = async () => {
        setLoading(true);
        try {
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const res = await vacancyService.getPublicVacancies(activeFilters);
            setVacancies(res.data || []);
        } catch (err) {
            console.error('Failed to fetch vacancies:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVacancies();
    }, [filters]);

    const handleApply = async (vacancy) => {
        if (!user) {
            alert('Please sign in or register to submit a job application.');
            return;
        }
        setAppliedVacancy(vacancy);
    };

    const submitApplication = async () => {
        if (!appliedVacancy) return;
        setApplying(true);
        try {
            await vacancyService.applyToVacancy(appliedVacancy.id);
            setAppliedSuccess(true);
        } catch (err) {
            alert(err.message || 'Failed to submit application.');
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-white">Foreign Job Vacancies</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Explore official job openings in Middle East Gulf countries posted by accredited Ethiopian agencies.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Search job title, skills..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-ethiopia-gold"
                    />
                </div>

                <select
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                    className="w-full md:w-56 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-ethiopia-gold"
                >
                    <option value="">All Countries</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Oman">Oman</option>
                </select>
            </div>

            {/* Vacancy Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
                    ))}
                </div>
            ) : vacancies.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                    <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="text-lg font-bold text-white">No Vacancies Available</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {vacancies.map((vacancy) => (
                        <VacancyCard key={vacancy.id} vacancy={vacancy} onApply={handleApply} />
                    ))}
                </div>
            )}

            {/* Application Modal */}
            {appliedVacancy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
                        {appliedSuccess ? (
                            <div className="space-y-4 py-4">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                                <h3 className="text-lg font-bold text-white">Application Submitted!</h3>
                                <p className="text-xs text-slate-300">
                                    Your application for <strong className="text-ethiopia-gold">{appliedVacancy.title}</strong> has been transmitted to the agency.
                                </p>
                                <button
                                    onClick={() => {
                                        setAppliedVacancy(null);
                                        setAppliedSuccess(false);
                                    }}
                                    className="px-6 py-2 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Briefcase className="w-10 h-10 text-ethiopia-gold mx-auto" />
                                <h3 className="text-lg font-bold text-white">Confirm Job Application</h3>
                                <p className="text-xs text-slate-300">
                                    Are you sure you want to submit your verified profile application for <strong className="text-ethiopia-gold">{appliedVacancy.title}</strong>?
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setAppliedVacancy(null)}
                                        className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitApplication}
                                        disabled={applying}
                                        className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs"
                                    >
                                        {applying ? 'Submitting...' : 'Confirm Application'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
