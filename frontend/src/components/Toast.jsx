import { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, removing: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />,
    error: <XCircle className="w-4 h-4 text-rose shrink-0" />,
    info: <Info className="w-4 h-4 text-accent shrink-0" />,
  };

  const borders = {
    success: 'border-emerald/30',
    error: 'border-rose/30',
    info: 'border-accent/30',
  };

  return (
    <div
      className={`glass flex items-center gap-3 px-4 py-3 shadow-lg ${borders[toast.type]} ${
        toast.removing ? 'animate-[slideOutRight_0.3s_ease forwards]' : 'animate-[slideInRight_0.3s_ease]'
      }`}
      style={{ animationFillMode: 'forwards' }}
    >
      {icons[toast.type]}
      <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
      </button>
    </div>
  );
}
