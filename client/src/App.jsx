import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider } from './context/InterviewContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import InterviewResult from './pages/InterviewResult';
import HistoryPage from './pages/History';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <InterviewProvider>
          <div className="min-h-screen flex flex-col bg-[#0b132b] text-slate-100 selection:bg-blue-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes (FR1) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/setup"
                  element={
                    <ProtectedRoute>
                      <InterviewSetup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/session"
                  element={
                    <ProtectedRoute>
                      <InterviewSession />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/result"
                  element={
                    <ProtectedRoute>
                      <InterviewResult />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 bg-slate-950/60">
              <div className="max-w-7xl mx-auto px-4 space-y-2">
                <p className="font-medium text-slate-400">
                  Interview AI Assistant — “Practice. Perform. Improve.”
                </p>
                <p>
                  Structured Mock Interviews • 4-Criteria Answer Scoring • Actionable Study Recommendations
                </p>
              </div>
            </footer>
          </div>
        </InterviewProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
