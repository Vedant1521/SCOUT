import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="glass-strong relative w-full max-w-md p-6 space-y-4"
        style={{ animation: 'scaleIn 0.2s ease' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(244, 63, 94, 0.15)' }}>
            <AlertTriangle className="w-5 h-5 text-rose" />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
