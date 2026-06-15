import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import RulesPage from './pages/RulesPage';
import ProfilesPage from './pages/ProfilesPage';
import AnalyzerPage from './pages/AnalyzerPage';
import LogPage from './pages/LogPage';
import SettingsPage from './pages/SettingsPage';

const PAGES = {
  dashboard: DashboardPage,
  rules: RulesPage,
  profiles: ProfilesPage,
  analyzer: AnalyzerPage,
  log: LogPage,
  settings: SettingsPage,
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<AppShell />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const Page = PAGES[activeTab];

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-h-screen overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 glass px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'var(--glass-bg)' }}
          >
            <svg className="w-5 h-5" style={{ color: 'var(--text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>SCOUT</span>
        </div>

        <div className="p-4 md:p-8 pt-16 md:pt-8 max-w-7xl mx-auto page-enter" key={activeTab}>
          <Page />
        </div>
      </main>
    </div>
  );
}
