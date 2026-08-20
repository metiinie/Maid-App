import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Briefcase, GitPullRequest, CreditCard, Plus, CheckCircle, AlertTriangle, FileText, ArrowRight, X, DollarSign } from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { vacancyService } from '../../services/vacancyService';
import { pipelineService } from '../../services/pipelineService';
import { subscriptionService } from '../../services/subscriptionService';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
    const { admin } = useAuth();
    const [activeTab, setActiveTab] = useState('candidates'); // candidates, vacancies, pipelines, subscription

    const [candidates, setCandidates] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [plans, setPlans] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentProvider, setPaymentProvider] = useState('chapa');
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutData, setCheckoutData] = useState(null);

    // New Candidate Form State
    const [newCand, setNewCand] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        passport_number: '',
        gender: 'female',
        age: '24',
        years_experience: '3',
        religion: 'christian',
        medical_status: 'cleared'
    });

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [candRes, vacRes, pipeRes, subRes, plansRes, invRes] = await Promise.all([
                candidateService.getAdminCandidates(),
                vacancyService.getAdminVacancies(),
                pipelineService.getAdminPipelines(),
                subscriptionService.getAgencySubscription(),
                subscriptionService.getSubscriptionPlans(),
                subscriptionService.getAgencyInvoices()
            ]);
            setCandidates(candRes.data || []);
            setVacancies(vacRes.data || []);
            setPipelines(pipeRes.data || []);
            setSubscription(subRes.data || null);
            setPlans(plansRes.data || []);
            setInvoices(invRes.data || []);
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    const handleCreateCandidate = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(newCand).forEach(([k, v]) => formData.append(k, v));
            await candidateService.createAdminCandidate(formData);
            setIsAddCandidateOpen(false);
            loadAdminData();
        } catch (err) {
            alert(err.message || 'Failed to add candidate.');
        }
    };

    const handleInitCheckout = async (plan) => {
        setSelectedPlan(plan);
        setCheckoutLoading(true);
        try {
            const res = await subscriptionService.initializeCheckout(plan.id, paymentProvider);
            setCheckoutData(res.data);
            setIsCheckoutOpen(true);
        } catch (err) {
            alert(err.message || 'Failed to initialize checkout session.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleVerifyCheckout = async () => {
        if (!checkoutData) return;
        setCheckoutLoading(true);
        try {
            await subscriptionService.verifyPayment(checkoutData.tx_ref, paymentProvider);
            alert('Subscription upgraded and activated successfully!');
            setIsCheckoutOpen(false);
            loadAdminData();
        } catch (err) {
            alert(err.message || 'Verification failed.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const advanceStage = async (pipelineId, nextStage) => {
        try {
            await pipelineService.advancePipelineStage(pipelineId, {
                next_stage: nextStage,
                notes: `Advanced to ${nextStage} from admin dashboard`
            });
            loadAdminData();
        } catch (err) {
            alert(err.message || 'Failed to advance stage.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* SaaS Admin Banner */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-ethiopia-gold/20">
                <div>
                    <span className="text-xs font-bold text-ethiopia-gold uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Manpower Agency SaaS Control Panel</span>
                    </span>
                    <h1 className="text-2xl font-extrabold text-white mt-1">{admin?.agency_name || 'Ethio-Dubai Recruitment Agency'}</h1>
                    <p className="text-xs text-slate-400">Admin Email: {admin?.email} • Agency ID: #{admin?.agency_id?.substring(0, 8)}</p>
                </div>

                {/* Subscription Status Pill */}
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Active SaaS Tier</div>
                        <div className="text-sm font-bold text-ethiopia-gold">{subscription?.plan?.name || 'Professional Plan'}</div>
                    </div>
                    <button
                        onClick={() => setActiveTab('subscription')}
                        className="px-3 py-1.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-sm hover:brightness-110"
                    >
                        Upgrade Plan
                    </button>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-2xl">
                    <div className="text-slate-400 text-xs font-semibold">Total Candidates</div>
                    <div className="text-2xl font-extrabold text-white mt-1">{candidates.length}</div>
                </div>
                <div className="glass-panel p-4 rounded-2xl">
                    <div className="text-slate-400 text-xs font-semibold">Active Vacancies</div>
                    <div className="text-2xl font-extrabold text-white mt-1">{vacancies.length}</div>
                </div>
                <div className="glass-panel p-4 rounded-2xl">
                    <div className="text-slate-400 text-xs font-semibold">Deployment Pipelines</div>
                    <div className="text-2xl font-extrabold text-white mt-1">{pipelines.length}</div>
                </div>
                <div className="glass-panel p-4 rounded-2xl">
                    <div className="text-slate-400 text-xs font-semibold">Billing Invoices</div>
                    <div className="text-2xl font-extrabold text-white mt-1">{invoices.length}</div>
                </div>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-full overflow-x-auto text-xs font-semibold">
                <button
                    onClick={() => setActiveTab('candidates')}
                    className={`flex-1 py-2.5 px-4 rounded-xl transition-colors whitespace-nowrap ${activeTab === 'candidates' ? 'gold-gradient-bg text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    Candidate Profiles ({candidates.length})
                </button>
                <button
                    onClick={() => setActiveTab('vacancies')}
                    className={`flex-1 py-2.5 px-4 rounded-xl transition-colors whitespace-nowrap ${activeTab === 'vacancies' ? 'gold-gradient-bg text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    Job Vacancies ({vacancies.length})
                </button>
                <button
                    onClick={() => setActiveTab('pipelines')}
                    className={`flex-1 py-2.5 px-4 rounded-xl transition-colors whitespace-nowrap ${activeTab === 'pipelines' ? 'gold-gradient-bg text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    Hiring Pipelines ({pipelines.length})
                </button>
                <button
                    onClick={() => setActiveTab('subscription')}
                    className={`flex-1 py-2.5 px-4 rounded-xl transition-colors whitespace-nowrap ${activeTab === 'subscription' ? 'gold-gradient-bg text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    Agency Subscription & Billing
                </button>
            </div>

            {/* Tab Contents */}
            {loading ? (
                <div className="h-96 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800"></div>
            ) : activeTab === 'candidates' ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Agency Candidate Database</h3>
                        <button
                            onClick={() => setIsAddCandidateOpen(true)}
                            className="px-4 py-2 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-md hover:brightness-110 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Candidate</span>
                        </button>
                    </div>

                    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
                        <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-4">Candidate</th>
                                    <th className="p-4">Passport / Phone</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Medical</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {candidates.map((cand) => (
                                    <tr key={cand.id} className="hover:bg-slate-900/50 transition-colors">
                                        <td className="p-4 font-bold text-white">{cand.first_name} {cand.last_name}</td>
                                        <td className="p-4">{cand.passport_number || 'N/A'} • {cand.phone}</td>
                                        <td className="p-4 text-ethiopia-gold font-semibold">{cand.category_name || 'Housemaid'}</td>
                                        <td className="p-4">
                                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                {cand.medical_status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded">
                                                {cand.is_active ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => alert(`Viewing candidate ID: ${cand.id}`)}
                                                className="text-ethiopia-gold hover:underline font-bold"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'vacancies' ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Active Job Vacancies</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vacancies.map((vac) => (
                            <div key={vac.id} className="glass-panel p-5 rounded-2xl space-y-3">
                                <h4 className="font-bold text-white text-sm">{vac.title}</h4>
                                <div className="text-xs text-slate-400">
                                    Target: <strong className="text-ethiopia-gold">{vac.target_country}</strong> • Salary: <strong className="text-white">{vac.salary_monthly} {vac.currency}</strong>
                                </div>
                                <div className="text-xs text-slate-400">Applications Received: <strong className="text-white">{vac.applications_count || 0}</strong></div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : activeTab === 'pipelines' ? (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-white">Deployment Pipeline Management</h3>
                    {pipelines.map((pipe) => (
                        <div key={pipe.id} className="glass-panel p-6 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-white text-base">Candidate: {pipe.candidate_name || 'Almaz Tesfaye'}</h4>
                                    <p className="text-xs text-slate-400">Employer: {pipe.employer_name} • Current Stage: <strong className="text-ethiopia-gold capitalize">{pipe.current_stage?.replace('_', ' ')}</strong></p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {pipe.current_stage === 'interviewing' && (
                                        <button onClick={() => advanceStage(pipe.id, 'medical_biometrics')} className="px-3 py-1.5 rounded-lg gold-gradient-bg text-slate-950 font-bold text-xs">
                                            Advance to Medical & Biometrics ➔
                                        </button>
                                    )}
                                    {pipe.current_stage === 'medical_biometrics' && (
                                        <button onClick={() => advanceStage(pipe.id, 'visa_processing')} className="px-3 py-1.5 rounded-lg gold-gradient-bg text-slate-950 font-bold text-xs">
                                            Advance to Visa Processing ➔
                                        </button>
                                    )}
                                    {pipe.current_stage === 'visa_processing' && (
                                        <button onClick={() => advanceStage(pipe.id, 'pre_departure_training')} className="px-3 py-1.5 rounded-lg gold-gradient-bg text-slate-950 font-bold text-xs">
                                            Advance to Pre-Departure Training ➔
                                        </button>
                                    )}
                                    {pipe.current_stage === 'pre_departure_training' && (
                                        <button onClick={() => advanceStage(pipe.id, 'deployed')} className="px-3 py-1.5 rounded-lg gold-gradient-bg text-slate-950 font-bold text-xs">
                                            Finalize Deployment Status ➔
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Subscription & Billing Tab */
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-white">Agency Subscription Tiers</h3>
                        <p className="text-xs text-slate-400">Select a plan to unlock higher candidate listing limits and instant payment activation via Chapa / Telebirr.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div key={plan.id} className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between border border-slate-800 hover:border-ethiopia-gold/40">
                                <div className="space-y-3">
                                    <div className="text-xs font-bold text-ethiopia-gold uppercase tracking-wider">{plan.code}</div>
                                    <h4 className="text-xl font-extrabold text-white">{plan.name}</h4>
                                    <div className="text-2xl font-black text-white">{plan.price_etb} <span className="text-xs font-medium text-slate-400">ETB / mo</span></div>
                                    <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-900">
                                        <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-ethiopia-gold" /> Candidate Limit: <strong>{plan.max_candidates}</strong></li>
                                        <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-ethiopia-gold" /> Vacancies Limit: <strong>{plan.max_vacancies}</strong></li>
                                        <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-ethiopia-gold" /> Featured Spotlights: <strong>{plan.max_featured_candidates}</strong></li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleInitCheckout(plan)}
                                    disabled={checkoutLoading}
                                    className="w-full py-3 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-md hover:brightness-110"
                                >
                                    Checkout Plan with Chapa
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Candidate Modal */}
            {isAddCandidateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                        <button onClick={() => setIsAddCandidateOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-white">Add New Candidate Profile</h3>
                        <form onSubmit={handleCreateCandidate} className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 mb-1">First Name *</label>
                                    <input type="text" required value={newCand.first_name} onChange={(e) => setNewCand({ ...newCand, first_name: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
                                </div>
                                <div>
                                    <label className="block text-slate-300 mb-1">Last Name *</label>
                                    <input type="text" required value={newCand.last_name} onChange={(e) => setNewCand({ ...newCand, last_name: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-300 mb-1">Passport Number *</label>
                                <input type="text" required value={newCand.passport_number} onChange={(e) => setNewCand({ ...newCand, passport_number: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
                            </div>
                            <button type="submit" className="w-full py-3 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs mt-2">
                                Save & Register Candidate
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {isCheckoutOpen && checkoutData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
                        <h3 className="text-xl font-bold text-white">Chapa / Telebirr Payment Verification</h3>
                        <p className="text-xs text-slate-300">
                            Transaction Ref: <strong className="text-ethiopia-gold">{checkoutData.tx_ref}</strong>
                        </p>
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-left space-y-2">
                            <div>Amount: <strong className="text-white">{checkoutData.amount} ETB</strong></div>
                            <div>Payment Provider: <strong className="text-ethiopia-gold uppercase">{checkoutData.payment_provider}</strong></div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleVerifyCheckout} disabled={checkoutLoading} className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs">
                                {checkoutLoading ? 'Verifying...' : 'Verify & Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
