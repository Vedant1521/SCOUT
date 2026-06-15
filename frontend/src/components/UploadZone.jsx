import { useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

export default function UploadZone({ onFileSelected }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.pcap')) {
      setFile(f);
      onFileSelected(f);
    }
  }

  function handleChange(e) {
    const f = e.target.files[0];
    if (f && f.name.endsWith('.pcap')) {
      setFile(f);
      onFileSelected(f);
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div
      className={`relative rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
        dragOver ? 'scale-[1.02]' : ''
      }`}
      style={{
        background: dragOver ? 'rgba(6, 182, 212, 0.08)' : 'var(--glass-bg)',
        border: `2px dashed ${dragOver ? '#10b981' : 'var(--glass-border)'}`,
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".pcap" onChange={handleChange} className="hidden" />
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div className="text-left">
            <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{file.name}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatSize(file.size)}</div>
          </div>
        </div>
      ) : (
        <div>
          <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--glass-bg)' }}>
            <Upload className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Drop a <span className="font-mono text-accent">.pcap</span> file here, or click to browse
          </p>
        </div>
      )}
    </div>
  );
}
