import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import AtsAnalyzerPage from './pages/AtsAnalyzerPage';
import JobAnalyzerPage from './pages/JobAnalyzerPage';
import CoverLetterPage from './pages/CoverLetterPage';
import PortfolioBuilderPage from './pages/PortfolioBuilderPage';
import PublicPortfolioPage from './pages/PublicPortfolioPage';
import CareerAdvisorPage from './pages/CareerAdvisorPage';
import CareerChatPage from './pages/CareerChatPage';
import InterviewPrepPage from './pages/InterviewPrepPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Landing & Auth Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/index.html" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Standalone Public Portfolio Page */}
        <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resume-builder" element={<ResumeBuilderPage />} />
          <Route path="/resume-builder/:id" element={<ResumeBuilderPage />} />
          <Route path="/ats-analyzer" element={<AtsAnalyzerPage />} />
          <Route path="/job-analyzer" element={<JobAnalyzerPage />} />
          <Route path="/cover-letter" element={<CoverLetterPage />} />
          <Route path="/portfolio-builder" element={<PortfolioBuilderPage />} />
          <Route path="/career-advisor" element={<CareerAdvisorPage />} />
          <Route path="/career-chat" element={<CareerChatPage />} />
          <Route path="/interview-prep" element={<InterviewPrepPage />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
