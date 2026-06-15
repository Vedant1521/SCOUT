import { Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 bg-muted/10">
      <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
          <Terminal className="w-4 h-4" />
          <span>Built for Windows</span>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <span className="hover:text-foreground transition-colors cursor-default">Privacy</span>
          <span className="hover:text-foreground transition-colors cursor-default">Terms</span>
        </div>
      </div>
    </footer>
  );
}
