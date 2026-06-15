import { Search, Zap, Activity, ArrowRight } from 'lucide-react';
import { Shield, BarChart3, CircleCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <section className="container mx-auto max-w-6xl px-4 pt-24 pb-16">
          <div className="relative flex flex-col items-center text-center space-y-8">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 select-none pointer-events-none">
              <pre className="font-mono text-[12px] leading-2.5 ascii-title">{`███████╗ ██████╗  ██████╗ ██╗   ██╗████████╗
██╔════╝██╔════╝ ██╔═══██╗██║   ██║╚══██╔══╝
███████╗██║      ██║   ██║██║   ██║   ██║   
╚════██║██║      ██║   ██║██║   ██║   ██║   
███████║╚██████╗ ╚██████╔╝╚██████╔╝   ██║   
╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝    ╚═╝`}</pre>
            </div>

            <div className="max-w-3xl space-y-4 pt-6">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                Master Your Network.
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                The intelligent DPI-powered blocking platform for Windows. Analyze traffic, block websites, and protect your network in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-full px-8 h-12 text-base transition-all cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/30"
                style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all rounded-full px-8 h-12 text-base cursor-pointer border shadow-xs hover:bg-muted/50"
                style={{ borderColor: 'var(--glass-border)', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-12">
          <div className="relative rounded-xl border shadow-2xl backdrop-blur-sm overflow-hidden" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg)' }}>
            <div className="absolute top-0 flex w-full items-center gap-1.5 border-b p-4" style={{ borderColor: 'var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
              <div className="h-3 w-3 rounded-full border" style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)' }} />
              <div className="h-3 w-3 rounded-full border" style={{ background: 'rgba(245, 158, 11, 0.2)', borderColor: 'rgba(245, 158, 11, 0.5)' }} />
              <div className="h-3 w-3 rounded-full border" style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.5)' }} />
              <div className="ml-4 text-xs font-mono text-muted-foreground">block_rules.json</div>
            </div>
            <div className="p-8 pt-16 font-mono text-sm overflow-x-auto">
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <span className="text-purple-500">const</span>{' '}
                  <span className="text-blue-500">engine</span> ={' '}
                  <span className="text-purple-500">await</span> dpi.createBlocker();
                </div>
                <div>
                  <span className="text-slate-500">// Deep packet inspection scans TLS SNI and HTTP headers</span><br />
                  <span className="text-purple-500">const</span>{' '}
                  <span className="text-blue-500">result</span> ={' '}
                  <span className="text-purple-500">await</span> engine.blockDomain(<span className="text-emerald-600">"youtube.com"</span>);
                </div>
                <div className="pl-4 border-l-2 border-primary/20 my-4">
                  <span className="text-slate-500">Output: </span>
                  <span className="text-emerald-600">"youtube.com and www.youtube.com blocked via hosts + firewall"</span>
                </div>
                <div>
                  <span className="text-purple-500">return</span> engine.getStatus();
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto max-w-6xl px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
            <div className="text-card-foreground gap-6 rounded-xl border shadow-sm md:col-span-2 p-8 flex flex-col justify-between overflow-hidden group border-border/50 hover:border-border transition-colors bg-gradient-to-br from-background to-muted/30">
              <div className="space-y-2 relative z-10">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">Deep Packet Inspection</h3>
                <p className="text-muted-foreground max-w-md">
                  Our engine inspects TLS SNI, HTTP Host headers, and DNS queries to classify and block traffic with precision. No data leaves your device.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Search className="w-64 h-64 -mb-12 -mr-12" />
              </div>
            </div>

            <div className="text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm md:row-span-2 p-8 border-border/50 hover:border-border transition-colors bg-gradient-to-b from-background to-muted/30">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-2">Real-time Blocking</h3>
              <p className="text-muted-foreground mb-8">Block domains, IPs, and ports instantly with system-level enforcement.</p>
              <div className="space-y-3">
                {['Domain blocking via hosts file', 'IP/Port blocking via Windows Firewall', 'Preset app blocking (YouTube, TikTok, etc.)'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CircleCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-6 border-border/50 hover:border-border transition-colors hover:bg-muted/20">
              <Zap className="w-8 h-8 mb-4 text-amber-500" />
              <h3 className="font-semibold mb-1">Lightweight</h3>
              <p className="text-sm text-muted-foreground">No kernel drivers. Pure userspace implementation using hosts file and netsh.</p>
            </div>

            <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-6 border-border/50 hover:border-border transition-colors hover:bg-muted/20">
              <Activity className="w-8 h-8 mb-4 text-blue-500" />
              <h3 className="font-semibold mb-1">Traffic Analysis</h3>
              <p className="text-sm text-muted-foreground">Upload .pcap captures to analyze protocols, apps, and test blocking rules.</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">Ready to secure your network?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Take control of your Windows device. Block distractions, protect privacy, and analyze traffic.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all rounded-full h-12 px-8 cursor-pointer bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            Get Started for Free
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
