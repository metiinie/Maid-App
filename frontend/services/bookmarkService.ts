import { storage } from './storage';

const VACANCIES_KEY = '@ethiohire_saved_vacancies';
const CANDIDATES_KEY = '@ethiohire_saved_candidates';

export interface SavedVacancy {
    id: string;
    title: string;
    target_country: string;
    salary_monthly: string;
    agency_name?: string;
    contract_type?: string;
    savedAt?: string;
}

export interface SavedCandidate {
    id: string;
    firstName: string;
    lastName: string;
    category: string;
    yearsOfExperience: number;
    medicalStatus: string;
    photoUrl?: string;
    savedAt?: string;
}

export const bookmarkService = {
    async getSavedVacancies(): Promise<SavedVacancy[]> {
        const raw = await storage.getItem(VACANCIES_KEY);
        if (!raw) {
            // Default initial saved vacancy
            return [
                {
                    id: 'vac-101',
                    title: 'Experienced Housemaid & Arabic Cook',
                    target_country: 'Saudi Arabia (Riyadh)',
                    salary_monthly: '1,500 SAR ($400 USD)',
                    agency_name: 'Ethio-Gulf Overseas Recruitment',
                    contract_type: '2-Year Renewable Contract',
                },
            ];
        }
        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    },

    async toggleSaveVacancy(vacancy: SavedVacancy): Promise<boolean> {
        const list = await this.getSavedVacancies();
        const exists = list.some((v) => v.id === vacancy.id);
        let updated: SavedVacancy[];
        if (exists) {
            updated = list.filter((v) => v.id !== vacancy.id);
        } else {
            updated = [{ ...vacancy, savedAt: new Date().toISOString() }, ...list];
        }
        await storage.setItem(VACANCIES_KEY, JSON.stringify(updated));
        return !exists;
    },

    async isVacancySaved(id: string): Promise<boolean> {
        const list = await this.getSavedVacancies();
        return list.some((v) => v.id === id);
    },

    async getSavedCandidates(): Promise<SavedCandidate[]> {
        const raw = await storage.getItem(CANDIDATES_KEY);
        if (!raw) {
            return [
                {
                    id: '1',
                    firstName: 'Alem',
                    lastName: 'Tadesse',
                    category: 'Housemaid & Cook',
                    yearsOfExperience: 3,
                    medicalStatus: 'Cleared',
                    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
                },
            ];
        }
        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    },

    async toggleSaveCandidate(candidate: SavedCandidate): Promise<boolean> {
        const list = await this.getSavedCandidates();
        const exists = list.some((c) => c.id === candidate.id);
        let updated: SavedCandidate[];
        if (exists) {
            updated = list.filter((c) => c.id !== candidate.id);
        } else {
            updated = [{ ...candidate, savedAt: new Date().toISOString() }, ...list];
        }
        await storage.setItem(CANDIDATES_KEY, JSON.stringify(updated));
        return !exists;
    },

    async isCandidateSaved(id: string): Promise<boolean> {
        const list = await this.getSavedCandidates();
        return list.some((c) => c.id === id);
    },
};
