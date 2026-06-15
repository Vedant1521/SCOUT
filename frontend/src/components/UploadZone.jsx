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
    if (f) {
      setFile(f);
      onFileSelected(f);
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
        dragOver ? 'border-indigo-400 bg-indigo-950/30' : 'border-gray-700 hover:border-gray-500'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".pcap" onChange={handleChange} className="hidden" />
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-indigo-400" />
          <div className="text-left">
            <div className="font-medium">{file.name}</div>
            <div className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
        </div>
      ) : (
        <div>
          <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500" />
          <p className="text-gray-400">Drop a <span className="font-mono text-indigo-400">.pcap</span> file here, or click to browse</p>
        </div>
      )}
    </div>
  );
}
