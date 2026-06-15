import {
  Shield, LayoutDashboard, Ban, Globe, FileSearch, ScrollText, Settings
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'rules', label: 'Blocking Rules', icon: Ban },
  { id: 'analyzer', label: 'DPI Analyzer', icon: FileSearch },
  { id: 'log', label: 'Block Log', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-gray-800">
        <Shield className="w-6 h-6 text-indigo-400" />
        <span className="font-bold text-sm">DPI Blocker</span>
      </div>
      <nav className="flex-1 py-3">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-3 border-t border-gray-800 text-xs text-gray-500">
        v2.0 • DPI-based Blocker
      </div>
    </aside>
  );
}
