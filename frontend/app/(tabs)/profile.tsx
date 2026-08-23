import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Modal,
    TextInput,
    Alert,
    Switch,
    RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
    ShieldCheck,
    User,
    Building2,
    LogOut,
    ChevronRight,
    Sparkles,
    FileText,
    Bell,
    CheckCircle2,
    Briefcase,
    Edit3,
    X,
    Globe,
    Lock,
    Eye,
    Check,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { RoleToggle } from '../../components/RoleToggle';
import { WorkspaceSwitcher } from '../../components/WorkspaceSwitcher';

export default function ProfileScreen() {
    const { user, admin, logoutUser, logoutAdmin, activeWorkspace, switchWorkspace, workspaces } = useAuth();
    const router = useRouter();

    const [refreshing, setRefreshing] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [editProfileVisible, setEditProfileVisible] = useState(false);

    // Profile editable state
    const [firstName, setFirstName] = useState(user?.first_name || 'Almaz');
    const [lastName, setLastName] = useState(user?.last_name || 'Tadesse');
    const [phone, setPhone] = useState(user?.phone || '+251 911 234 567');
    const [city, setCity] = useState('Addis Ababa (Bole)');
    const [targetCountry, setTargetCountry] = useState('Saudi Arabia');

    // App Preferences State
    const [language, setLanguage] = useState<'EN' | 'AM'>('EN');
    const [biometricsEnabled, setBiometricsEnabled] = useState(true);
    const [pushNotifsEnabled, setPushNotifsEnabled] = useState(true);

    const currentMode = activeWorkspace?.type === 'GULF_EMPLOYER' ? 'employer' : 'seeker';

    useFocusEffect(
        useCallback(() => {
            // Auto-sync user state on focus
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 600);
    };

    const handleSelectMode = async (newMode: 'employer' | 'seeker') => {
        const targetType = newMode === 'employer' ? 'GULF_EMPLOYER' : 'PERSONAL';
        const target = workspaces.find((w) => w.type === targetType) || workspaces[0];
        if (target) {
            await switchWorkspace(target.id);
        }
    };

    const handleSaveProfile = () => {
        setEditProfileVisible(false);
        Alert.alert('Profile Updated', 'Your personal details have been saved successfully.');
    };

    const isAdmin = !!admin;

    const documentsList = [
        {
            id: 'doc-1',
            title: 'GAMCA Medical Clearance Report',
            type: 'GAMCA_MEDICAL',
            status: 'CLEARED (Fit for Duty)',
            statusColor: 'emerald',
            issueDate: 'Jan 15, 2026',
            expiryDate: 'Jan 15, 2028',
            issuedBy: 'GAMCA Medical Center Addis Ababa',
            docRef: 'GMC-ET-2026-8849',
        },
        {
            id: 'doc-2',
            title: 'MOLSA Skill Assessment Certificate',
            type: 'MOLSA_CERTIFICATE',
            status: 'Certified Level 2',
            statusColor: 'blue',
            issueDate: 'Feb 10, 2026',
            expiryDate: 'Feb 10, 2029',
            issuedBy: 'Ministry of Labor & Skills (Ethiopia)',
            docRef: 'MOLSA-CERT-2026-042',
        },
        {
            id: 'doc-3',
            title: 'Ethiopian Passport Credential',
            type: 'PASSPORT',
            status: 'Valid Passport',
            statusColor: 'amber',
            issueDate: 'Nov 20, 2020',
            expiryDate: 'Nov 20, 2030',
            issuedBy: 'Immigration & Citizenship Service (Addis Ababa)',
            docRef: 'EP-7483920',
        },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            {/* Top Bar Header */}
            <View className="bg-slate-900 px-5 pt-14 pb-6 shadow-md">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-white text-xl font-black tracking-wide">Account Profile</Text>
                        <Text className="text-slate-400 text-xs font-medium mt-0.5">
                            Manage workspace, persona & system preferences
                        </Text>
                    </View>

                    {isAdmin ? (
                        <View className="bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                            <Text className="text-amber-400 text-[10px] font-black uppercase">AGENCY ADMIN</Text>
                        </View>
                    ) : (
                        <View className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full flex-row items-center gap-1">
                            <CheckCircle2 size={10} color="#10B981" />
                            <Text className="text-emerald-400 text-[10px] font-black uppercase">VERIFIED USER</Text>
                        </View>
                    )}
                </View>

                {/* User Identity Card */}
                <View className="flex-row items-center gap-4 mt-5 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
                    <View className="w-14 h-14 rounded-2xl bg-amber-500 items-center justify-center shadow-xs">
                        <Text className="text-slate-950 text-xl font-black">
                            {firstName ? firstName[0] : (admin?.email ? admin.email[0].toUpperCase() : 'U')}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-base font-black">
                            {firstName ? `${firstName} ${lastName}` : (admin?.email || 'Authenticated User')}
                        </Text>
                        <Text className="text-amber-400 text-xs font-bold mt-0.5">
                            {activeWorkspace?.name || 'Personal Account'}
                        </Text>
                        <Text className="text-slate-400 text-[11px] font-medium mt-0.5">
                            {phone} • {city}
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => setEditProfileVisible(true)}
                        className="p-2.5 bg-slate-700/80 rounded-xl border border-slate-600 active:opacity-80"
                    >
                        <Edit3 size={16} color="#F59E0B" />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-5 pt-5"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Persona Mode Switcher Card */}
                <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-xs">
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center gap-2">
                            <Sparkles size={18} color="#D97706" />
                            <Text className="text-slate-900 text-base font-black">Persona & Feed Mode</Text>
                        </View>
                        <View className="bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                            <Text className="text-amber-800 text-[10px] font-extrabold capitalize">{currentMode}</Text>
                        </View>
                    </View>
                    <Text className="text-slate-500 text-xs font-medium mb-3">
                        Switch persona mode to explore candidates or overseas vacancies.
                    </Text>

                    <RoleToggle mode={currentMode} onSelectMode={handleSelectMode} />
                </View>

                {/* Active Workspace Selector Card */}
                <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-xs">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <Building2 size={18} color="#059669" />
                            <Text className="text-slate-900 text-base font-black">Active Workspace</Text>
                        </View>

                        <WorkspaceSwitcher />
                    </View>

                    <View className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex-row items-center justify-between">
                        <View className="flex-1 mr-2">
                            <Text className="text-slate-900 text-sm font-extrabold">{activeWorkspace?.name}</Text>
                            <Text className="text-slate-500 text-xs font-semibold mt-0.5">
                                Role Context: <Text className="text-emerald-700 font-bold">{activeWorkspace?.role || 'JOB_SEEKER'}</Text>
                            </Text>
                        </View>
                        {activeWorkspace?.isVerified && (
                            <View className="bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full flex-row items-center gap-1">
                                <ShieldCheck size={12} color="#059669" />
                                <Text className="text-emerald-800 text-[10px] font-black uppercase">VERIFIED</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Candidate Document Vault & Medical Clearance */}
                <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-xs">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <ShieldCheck size={18} color="#059669" />
                            <Text className="text-slate-900 text-base font-black">Candidate Document Vault</Text>
                        </View>
                        <View className="bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <Text className="text-emerald-800 text-[10px] font-extrabold">3/3 Verified</Text>
                        </View>
                    </View>
                    <Text className="text-slate-500 text-xs font-medium mb-4">
                        Required government and medical clearance documents for Gulf deployment.
                    </Text>

                    <View className="gap-2.5">
                        {documentsList.map((doc) => (
                            <View key={doc.id} className="flex-row items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                <View className="flex-row items-center gap-3 flex-1 mr-2">
                                    <View
                                        className={`w-8 h-8 rounded-xl items-center justify-center border ${doc.statusColor === 'emerald'
                                            ? 'bg-emerald-100 border-emerald-200'
                                            : doc.statusColor === 'blue'
                                                ? 'bg-blue-100 border-blue-200'
                                                : 'bg-amber-100 border-amber-200'
                                            }`}
                                    >
                                        {doc.statusColor === 'emerald' ? (
                                            <CheckCircle2 size={16} color="#059669" />
                                        ) : doc.statusColor === 'blue' ? (
                                            <FileText size={16} color="#2563EB" />
                                        ) : (
                                            <ShieldCheck size={16} color="#D97706" />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 text-xs font-extrabold" numberOfLines={1}>{doc.title}</Text>
                                        <Text className="text-emerald-700 text-[10px] font-bold" numberOfLines={1}>Status: {doc.status}</Text>
                                    </View>
                                </View>
                                <Pressable
                                    onPress={() => setSelectedDoc(doc)}
                                    className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl active:opacity-80"
                                >
                                    <Text className="text-slate-700 text-[11px] font-extrabold">Inspect</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Preferences & System Settings */}
                <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-xs">
                    <Text className="text-slate-900 text-base font-black mb-3">App Preferences & Security</Text>

                    <View className="gap-3">
                        {/* Language Selection */}
                        <View className="flex-row items-center justify-between py-1 border-b border-slate-100">
                            <View className="flex-row items-center gap-2.5">
                                <Globe size={18} color="#059669" />
                                <View>
                                    <Text className="text-slate-900 text-xs font-bold">Display Language</Text>
                                    <Text className="text-slate-500 text-[10px] font-medium">English / Amharic (አማርኛ)</Text>
                                </View>
                            </View>
                            <View className="flex-row gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <Pressable
                                    onPress={() => setLanguage('EN')}
                                    className={`px-2.5 py-1 rounded-lg ${language === 'EN' ? 'bg-emerald-600' : ''}`}
                                >
                                    <Text className={`text-[10px] font-extrabold ${language === 'EN' ? 'text-white' : 'text-slate-700'}`}>EN</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setLanguage('AM')}
                                    className={`px-2.5 py-1 rounded-lg ${language === 'AM' ? 'bg-emerald-600' : ''}`}
                                >
                                    <Text className={`text-[10px] font-extrabold ${language === 'AM' ? 'text-white' : 'text-slate-700'}`}>አማርኛ</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Biometrics */}
                        <View className="flex-row items-center justify-between py-1 border-b border-slate-100">
                            <View className="flex-row items-center gap-2.5">
                                <Lock size={18} color="#D97706" />
                                <View>
                                    <Text className="text-slate-900 text-xs font-bold">Biometric Auth</Text>
                                    <Text className="text-slate-500 text-[10px] font-medium">Require Face ID / Fingerprint</Text>
                                </View>
                            </View>
                            <Switch
                                value={biometricsEnabled}
                                onValueChange={setBiometricsEnabled}
                                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        {/* Push Notifications */}
                        <View className="flex-row items-center justify-between py-1">
                            <View className="flex-row items-center gap-2.5">
                                <Bell size={18} color="#2563EB" />
                                <View>
                                    <Text className="text-slate-900 text-xs font-bold">Push Notifications</Text>
                                    <Text className="text-slate-500 text-[10px] font-medium">Job & medical status alerts</Text>
                                </View>
                            </View>
                            <Switch
                                value={pushNotifsEnabled}
                                onValueChange={setPushNotifsEnabled}
                                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>

                {/* Account Controls */}
                <View className="bg-white border border-slate-200 rounded-3xl overflow-hidden mb-6 shadow-xs">
                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider px-5 pt-4 pb-2">
                        Account Controls
                    </Text>

                    <Pressable
                        onPress={() => router.push('/(auth)/mode-select')}
                        className="px-5 py-4 flex-row items-center justify-between border-b border-slate-100 active:bg-slate-50"
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center border border-amber-200/60">
                                <User size={18} color="#D97706" />
                            </View>
                            <View>
                                <Text className="text-slate-900 text-xs font-bold">Change Account Persona</Text>
                                <Text className="text-slate-500 text-[11px] font-medium">Re-select default role & workspace</Text>
                            </View>
                        </View>
                        <ChevronRight size={16} color="#94A3B8" />
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/(user)/dashboard')}
                        className="px-5 py-4 flex-row items-center justify-between border-b border-slate-100 active:bg-slate-50"
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center border border-blue-200/60">
                                <FileText size={18} color="#2563EB" />
                            </View>
                            <View>
                                <Text className="text-slate-900 text-xs font-bold">My Applications & Saved</Text>
                                <Text className="text-slate-500 text-[11px] font-medium">Track submitted job applications</Text>
                            </View>
                        </View>
                        <ChevronRight size={16} color="#94A3B8" />
                    </Pressable>

                    {isAdmin && (
                        <Pressable
                            onPress={() => router.push('/(admin)/dashboard')}
                            className="px-5 py-4 flex-row items-center justify-between border-b border-slate-100 active:bg-slate-50"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-200/60">
                                    <Briefcase size={18} color="#059669" />
                                </View>
                                <View>
                                    <Text className="text-slate-900 text-xs font-bold">Agency Admin Control Center</Text>
                                    <Text className="text-slate-500 text-[11px] font-medium">Manage candidates, vacancies & pipelines</Text>
                                </View>
                            </View>
                            <ChevronRight size={16} color="#94A3B8" />
                        </Pressable>
                    )}

                    <Pressable
                        onPress={async () => {
                            if (isAdmin) await logoutAdmin();
                            await logoutUser();
                            router.replace('/(auth)/login');
                        }}
                        className="px-5 py-4 flex-row items-center justify-between active:bg-red-50/50"
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center border border-red-200/60">
                                <LogOut size={18} color="#DC2626" />
                            </View>
                            <View>
                                <Text className="text-red-600 text-xs font-bold">Sign Out</Text>
                                <Text className="text-slate-400 text-[11px] font-medium">Safely terminate active session</Text>
                            </View>
                        </View>
                        <ChevronRight size={16} color="#94A3B8" />
                    </Pressable>
                </View>
            </ScrollView>

            {/* Document Vault Inspector Modal */}
            <Modal visible={!!selectedDoc} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center p-5">
                    <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-100">
                            <View className="flex-row items-center gap-2">
                                <ShieldCheck size={20} color="#059669" />
                                <Text className="text-slate-900 text-base font-extrabold">Document Credential</Text>
                            </View>
                            <Pressable onPress={() => setSelectedDoc(null)} className="p-1 bg-slate-100 rounded-full">
                                <X size={18} color="#64748B" />
                            </Pressable>
                        </View>

                        {selectedDoc && (
                            <View className="gap-2.5 my-2">
                                <Text className="text-slate-900 text-base font-black">{selectedDoc.title}</Text>
                                <View className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start">
                                    <Text className="text-emerald-800 text-xs font-bold">Status: {selectedDoc.status}</Text>
                                </View>

                                <View className="bg-slate-50 p-3 rounded-2xl border border-slate-200 gap-1.5 mt-2">
                                    <Text className="text-xs text-slate-600 font-medium">
                                        <Text className="font-bold text-slate-800">Doc Reference:</Text> {selectedDoc.docRef}
                                    </Text>
                                    <Text className="text-xs text-slate-600 font-medium">
                                        <Text className="font-bold text-slate-800">Issued By:</Text> {selectedDoc.issuedBy}
                                    </Text>
                                    <Text className="text-xs text-slate-600 font-medium">
                                        <Text className="font-bold text-slate-800">Issue Date:</Text> {selectedDoc.issueDate}
                                    </Text>
                                    <Text className="text-xs text-slate-600 font-medium">
                                        <Text className="font-bold text-slate-800">Expiry Date:</Text> {selectedDoc.expiryDate}
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() => setSelectedDoc(null)}
                                    className="mt-4 bg-emerald-600 py-3 rounded-xl items-center active:opacity-90 shadow-xs"
                                >
                                    <Text className="text-white text-xs font-extrabold">Close Credential Inspector</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Profile Edit Info Modal */}
            <Modal visible={editProfileVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center p-5">
                    <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-100">
                            <View className="flex-row items-center gap-2">
                                <Edit3 size={20} color="#D97706" />
                                <Text className="text-slate-900 text-base font-extrabold">Edit Profile Info</Text>
                            </View>
                            <Pressable onPress={() => setEditProfileVisible(false)} className="p-1 bg-slate-100 rounded-full">
                                <X size={18} color="#64748B" />
                            </Pressable>
                        </View>

                        <View className="gap-3 my-2">
                            <View>
                                <Text className="text-slate-700 text-xs font-bold mb-1">First Name</Text>
                                <TextInput
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold"
                                />
                            </View>
                            <View>
                                <Text className="text-slate-700 text-xs font-bold mb-1">Last Name</Text>
                                <TextInput
                                    value={lastName}
                                    onChangeText={setLastName}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold"
                                />
                            </View>
                            <View>
                                <Text className="text-slate-700 text-xs font-bold mb-1">Phone Number</Text>
                                <TextInput
                                    value={phone}
                                    onChangeText={setPhone}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold"
                                />
                            </View>
                            <View>
                                <Text className="text-slate-700 text-xs font-bold mb-1">City / Region</Text>
                                <TextInput
                                    value={city}
                                    onChangeText={setCity}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold"
                                />
                            </View>

                            <View className="flex-row gap-3 mt-3">
                                <Pressable
                                    onPress={() => setEditProfileVisible(false)}
                                    className="flex-1 bg-slate-100 border border-slate-200 py-3 rounded-xl items-center"
                                >
                                    <Text className="text-slate-700 text-xs font-bold">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleSaveProfile}
                                    className="flex-1 bg-amber-500 py-3 rounded-xl items-center active:opacity-90 shadow-xs"
                                >
                                    <Text className="text-slate-950 text-xs font-black">Save Changes</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

