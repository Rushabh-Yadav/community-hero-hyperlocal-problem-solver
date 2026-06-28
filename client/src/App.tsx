import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';

// Layout & pages imports
import PageWrapper from './components/layout/PageWrapper.js';
import Landing from './pages/Landing.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import CitizenDashboard from './pages/CitizenDashboard.js';
import ReportIssue from './pages/ReportIssue.js';
import IssueDetails from './pages/IssueDetails.js';
import OfficerDashboard from './pages/OfficerDashboard.js';
import AdminDashboard from './pages/AdminDashboard.js';
import ImpactDashboard from './pages/ImpactDashboard.js';
import PredictiveAI from './pages/PredictiveAI.js';
import Leaderboard from './pages/Leaderboard.js';
import ChatAssistant from './pages/ChatAssistant.js';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Guard route component for authentication checks
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: ('citizen' | 'moderator' | 'officer' | 'admin')[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-neutral-400">Verifying security clearances...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // If not authorized, redirect to their default landing
    return <Navigate to="/" replace />;
  }

  return <PageWrapper>{children}</PageWrapper>;
};

// Layout route helper for public pages requiring navbar/sidebar grids
const LayoutRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PageWrapper>{children}</PageWrapper>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public landing pathways */}
              <Route path="/" element={<LayoutRoute><Landing /></LayoutRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public information portals wrapped in layout */}
              <Route path="/leaderboard" element={<LayoutRoute><Leaderboard /></LayoutRoute>} />
              <Route path="/impact" element={<LayoutRoute><ImpactDashboard /></LayoutRoute>} />

              {/* Citizen workspace */}
              <Route 
                path="/dashboard/citizen" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/report" 
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <ReportIssue />
                  </ProtectedRoute>
                } 
              />

              {/* Shared issue inspector */}
              <Route 
                path="/issue/:id" 
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'officer', 'admin']}>
                    <IssueDetails />
                  </ProtectedRoute>
                } 
              />

              {/* Predictive AI map */}
              <Route 
                path="/predictive" 
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'officer', 'admin']}>
                    <PredictiveAI />
                  </ProtectedRoute>
                } 
              />

              {/* AI Chatbot Assistant */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'officer', 'admin']}>
                    <ChatAssistant />
                  </ProtectedRoute>
                } 
              />

              {/* Municipal Officer workspace */}
              <Route 
                path="/dashboard/officer" 
                element={
                  <ProtectedRoute allowedRoles={['officer', 'admin']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Administrative console */}
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
