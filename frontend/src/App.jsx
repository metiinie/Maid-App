import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ChatDrawer from './components/common/ChatDrawer';

// Pages
import Home from './pages/public/Home';
import CandidateSearch from './pages/public/CandidateSearch';
import VacancySearch from './pages/public/VacancySearch';
import AgenciesDirectory from './pages/public/AgenciesDirectory';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <ChatProvider>
                    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 font-sans">
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/candidates" element={<CandidateSearch />} />
                                <Route path="/vacancies" element={<VacancySearch />} />
                                <Route path="/agencies" element={<AgenciesDirectory />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/dashboard" element={<UserDashboard />} />
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            </Routes>
                        </main>
                        <Footer />
                        <ChatDrawer />
                    </div>
                </ChatProvider>
            </AuthProvider>
        </Router>
    );
}
