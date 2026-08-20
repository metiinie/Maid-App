import React, { useState } from 'react';
import { X, Send, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { candidateService } from '../../services/candidateService';

export default function InquiryModal({ candidate, isOpen, onClose }) {
    const [formData, setFormData] = useState({
        employer_name: '',
        phone: '',
        email: '',
        employer_country: 'United Arab Emirates',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !candidate) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await candidateService.submitInquiry(candidate.id, formData);
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Failed to submit inquiry. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {submitted ? (
                    <div className="py-10 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Inquiry Submitted Successfully!</h3>
                        <p className="text-sm text-slate-300 max-w-md mx-auto">
                            Your candidate request for <strong className="text-ethiopia-gold">{candidate.first_name} {candidate.last_name}</strong> has been transmitted directly to <strong className="text-white">{candidate.agency_name || 'the agency'}</strong>. They will contact you shortly.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-sm hover:brightness-110 transition-all"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Header info */}
                        <div>
                            <div className="text-xs font-semibold text-ethiopia-gold uppercase tracking-wider">Candidate Inquiry</div>
                            <h3 className="text-xl font-bold text-white">
                                Request {candidate.first_name} {candidate.last_name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Category: {candidate.category_name || 'Housemaid'} • Agency: {candidate.agency_name || 'Verified Agency'}
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-ethiopia-crimson/10 border border-ethiopia-crimson/30 rounded-xl text-ethiopia-crimson text-xs font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Your Name / Business Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.employer_name}
                                    onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
                                    placeholder="e.g. Al-Maktoum Family / Ahmed Al-Mansoor"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-ethiopia-gold text-sm text-white focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Phone / WhatsApp *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+971 50 123 4567"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-ethiopia-gold text-sm text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">Country *</label>
                                    <select
                                        value={formData.employer_country}
                                        onChange={(e) => setFormData({ ...formData, employer_country: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-ethiopia-gold text-sm text-white focus:outline-none"
                                    >
                                        <option value="United Arab Emirates">United Arab Emirates</option>
                                        <option value="Saudi Arabia">Saudi Arabia</option>
                                        <option value="Qatar">Qatar</option>
                                        <option value="Kuwait">Kuwait</option>
                                        <option value="Oman">Oman</option>
                                        <option value="Bahrain">Bahrain</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="ahmed@example.com"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-ethiopia-gold text-sm text-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Specific Requirements / Message</label>
                                <textarea
                                    rows="3"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Please state expected deployment date, salary offer, or family size details..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-ethiopia-gold text-sm text-white focus:outline-none resize-none"
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 rounded-xl gold-gradient-bg text-slate-950 font-bold text-sm shadow-lg shadow-ethiopia-gold/20 hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                <span>{submitting ? 'Submitting Inquiry...' : 'Send Candidate Request'}</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
