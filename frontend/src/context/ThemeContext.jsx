import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

function playTick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Main click — short high-frequency pop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);

    // Subtle click — noise-like transient for realism
    const buf = ctx.createBuffer(1, 1200, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < 1200; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / 1200, 8);
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = buf;
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(0.08, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    noise.start(ctx.currentTime);

    setTimeout(() => ctx.close(), 200);
  } catch {}
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dpi-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dpi-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    playTick();
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
