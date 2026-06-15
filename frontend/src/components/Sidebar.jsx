import { LayoutDashboard, Ban, FileSearch, ScrollText, Settings, Sun, Moon, X, Bookmark } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'rules', label: 'Blocking Rules', icon: Ban },
  { id: 'profiles', label: 'Profiles', icon: Bookmark },
  { id: 'analyzer', label: 'DPI Analyzer', icon: FileSearch },
  { id: 'log', label: 'Block Log', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange, open, onClose }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.15s ease' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-60 flex flex-col shrink-0 transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--glass-border)',
        }}
      >
        <div className="flex items-center justify-between px-4 h-14" style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-md object-cover" />
            <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>SCOUT</span>
          </div>
          <button onClick={onClose} className="md:hidden p-1 rounded-md" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
                style={{
                  background: isActive ? 'var(--glass-bg-strong)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 500 : 400,
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--glass-bg)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="px-2 pb-3 space-y-1" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="px-3 py-1 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            v3.0
          </div>
        </div>
      </aside>
    </>
  );
}
