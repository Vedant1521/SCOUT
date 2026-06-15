import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import RulesPage from './pages/RulesPage';
import AnalyzerPage from './pages/AnalyzerPage';
import LogPage from './pages/LogPage';
import SettingsPage from './pages/SettingsPage';

const PAGES = {
  dashboard: DashboardPage,
  rules: RulesPage,
  analyzer: AnalyzerPage,
  log: LogPage,
  settings: SettingsPage,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const Page = PAGES[activeTab];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        <Page />
      </main>
    </div>
  );
}
