import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="sticky top-0 z-50" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex flex-row justify-between items-center px-2 py-1">
        <nav className="flex text-lg items-center justify-center">
          <Link to="/" className="flex items-center justify-center">
            <img
              alt="Logo"
              loading="lazy"
              width="60"
              height="60"
              decoding="async"
              src="/logo.png"
            />
            <div className="font-mono" style={{ color: 'var(--text-primary)' }}>SCOUT</div>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 w-9 border shadow-xs hover:bg-accent hover:text-accent-foreground"
            style={{ borderColor: 'var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            <span className="sr-only">Toggle theme</span>
          </button>
        </div>
      </div>
    </div>
  );
}
