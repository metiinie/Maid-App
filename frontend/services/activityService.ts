import api from './api';

// ─── Sample Data ───────────────────────────────────────────────

export interface Application {
    id: string;
    vacancy_title: string;
    target_country: string;
    country_flag: string;
    agency_name: string;
    salary_range: string;
    status: 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';
    applied_at: string;
    last_updated: string;
    notes?: string;
}

export interface Inquiry {
    id: string;
    candidate_name: string;
    candidate_code: string;
    skill_category: string;
    agency_name: string;
    status: 'SENT' | 'VIEWED' | 'RESPONDED' | 'INTERVIEW_SCHEDULED' | 'HIRED' | 'DECLINED';
    sent_at: string;
    last_updated: string;
    notes?: string;
}

const sampleApplications: Application[] = [
    {
        id: 'app-1',
        vacancy_title: 'Domestic Worker & Housekeeper',
        target_country: 'Saudi Arabia',
        country_flag: '🇸🇦',
        agency_name: 'Ethio-Gulf Overseas Recruitment',
        salary_range: 'SAR 1,500 – 2,000 / month',
        status: 'UNDER_REVIEW',
        applied_at: '2026-08-18',
        last_updated: '2026-08-22',
        notes: 'Agency reviewing your GAMCA medical clearance documents.',
    },
    {
        id: 'app-2',
        vacancy_title: 'Child Caregiver & Nanny',
        target_country: 'UAE',
        country_flag: '🇦🇪',
        agency_name: 'Addis Manpower Solutions',
        salary_range: 'AED 1,800 – 2,200 / month',
        status: 'SHORTLISTED',
        applied_at: '2026-08-12',
        last_updated: '2026-08-21',
        notes: 'You have been shortlisted! Await interview scheduling.',
    },
    {
        id: 'app-3',
        vacancy_title: 'Elderly Caregiver Specialist',
        target_country: 'Kuwait',
        country_flag: '🇰🇼',
        agency_name: 'Horn of Africa Employment Agency',
        salary_range: 'KWD 180 – 250 / month',
        status: 'APPLIED',
        applied_at: '2026-08-23',
        last_updated: '2026-08-23',
    },
    {
        id: 'app-4',
        vacancy_title: 'Senior Housemaid & Arabic Cook',
        target_country: 'Qatar',
        country_flag: '🇶🇦',
        agency_name: 'Ethio-Gulf Overseas Recruitment',
        salary_range: 'QAR 2,000 – 2,500 / month',
        status: 'INTERVIEW',
        applied_at: '2026-08-05',
        last_updated: '2026-08-20',
        notes: 'Video interview scheduled for Aug 28 at 10:00 AM EAT.',
    },
];

const sampleInquiries: Inquiry[] = [
    {
        id: 'inq-1',
        candidate_name: 'Tigist Wolde',
        candidate_code: 'ET-8490',
        skill_category: 'Experienced Domestic Worker',
        agency_name: 'Ethio-Gulf Overseas Recruitment',
        status: 'RESPONDED',
        sent_at: '2026-08-15',
        last_updated: '2026-08-22',
        notes: 'Agency confirmed candidate availability. Contract terms shared.',
    },
    {
        id: 'inq-2',
        candidate_name: 'Almaz Bekele',
        candidate_code: 'ET-8501',
        skill_category: 'Nanny & Child Caregiver',
        agency_name: 'Addis Manpower Solutions',
        status: 'INTERVIEW_SCHEDULED',
        sent_at: '2026-08-10',
        last_updated: '2026-08-21',
        notes: 'Video interview arranged for Aug 26 at 2:00 PM GST.',
    },
    {
        id: 'inq-3',
        candidate_name: 'Genet Tadesse',
        candidate_code: 'ET-8515',
        skill_category: 'Arabic Cook & Housekeeper',
        agency_name: 'Horn of Africa Employment Agency',
        status: 'SENT',
        sent_at: '2026-08-23',
        last_updated: '2026-08-23',
    },
    {
        id: 'inq-4',
        candidate_name: 'Meskerm Haile',
        candidate_code: 'ET-8522',
        skill_category: 'Elderly Caregiver',
        agency_name: 'Ethio-Gulf Overseas Recruitment',
        status: 'HIRED',
        sent_at: '2026-07-28',
        last_updated: '2026-08-18',
        notes: 'Contract signed. Candidate entering pre-departure training.',
    },
];

// ─── Service ───────────────────────────────────────────────────

export const activityService = {
    /** Fetch job applications for the logged-in seeker */
    async getUserApplications(): Promise<Application[]> {
        try {
            const res: any = await api.get('/users/me/applications');
            if (res.data && res.data.length > 0) return res.data;
            return sampleApplications;
        } catch {
            return sampleApplications;
        }
    },

    /** Fetch hiring inquiries for the logged-in employer */
    async getEmployerInquiries(): Promise<Inquiry[]> {
        try {
            const res: any = await api.get('/employers/me/inquiries');
            if (res.data && res.data.length > 0) return res.data;
            return sampleInquiries;
        } catch {
            return sampleInquiries;
        }
    },
};
