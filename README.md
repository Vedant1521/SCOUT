# DPI Website Blocker

> Block websites on your Windows device using Deep Packet Inspection principles. A full-stack web application with a Node.js backend, React frontend, and C++ DPI engine for traffic analysis.

---

## Table of Contents

- [What This Project Does](#1-what-this-project-does)
- [Features](#2-features)
- [System Requirements](#3-system-requirements)
- [Complete Setup Guide (Step-by-Step)](#4-complete-setup-guide-step-by-step)
- [How to Use the Web Dashboard](#5-how-to-use-the-web-dashboard)
- [How Blocking Works](#6-how-blocking-works)
- [DPI Analysis (PCAP Upload)](#7-dpi-analysis-pcap-upload)
- [API Reference](#8-api-reference)
- [Project Structure](#9-project-structure)
- [Architecture](#10-architecture)
- [Production Deployment](#11-production-deployment)
- [Troubleshooting](#12-troubleshooting)
- [Technical Background](#13-technical-background)

---

## 1. What This Project Does

This is a **full-stack website blocker** for Windows. It gives you a web dashboard to manage which websites, IPs, and ports are blocked on your device. It works in two ways:

1. **Live Blocking** — Adds entries to the Windows hosts file and Windows Firewall rules in real-time from the web UI
2. **DPI Analysis** — Upload `.pcap` network captures and the C++ engine inspects TLS SNI, HTTP Host headers, and DNS queries to classify traffic

```
┌──────────────────────────────────────────────────────┐
│  Web Dashboard (React)                               │
│  http://localhost:5173                                │
│                                                      │
│  [Dashboard] [Rules] [Analyzer] [Log] [Settings]     │
└────────────────────┬─────────────────────────────────┘
                     │  API calls
                     ▼
┌──────────────────────────────────────────────────────┐
│  Backend (Node.js + Express)                         │
│  http://localhost:3001                                │
│                                                      │
│  /api/rules    → Manage blocking rules               │
│  /api/status   → System health check                 │
│  /api/upload   → PCAP analysis                       │
│  /api/logs     → Block history                       │
└────────┬─────────────────┬───────────────────────────┘
         │                 │
         ▼                 ▼
┌────────────────┐  ┌──────────────────────────────┐
│ Hosts File     │  │ C++ DPI Engine               │
│ + Firewall     │  │ (PCAP analysis only)         │
└────────────────┘  └──────────────────────────────┘
```

---

## 2. Features

| Category | Feature |
|----------|---------|
| **Domain Blocking** | Block websites via Windows hosts file — instant, system-wide |
| **IP Blocking** | Block IPs via Windows Firewall outbound rules |
| **Port Blocking** | Block ports (TCP + UDP) via Windows Firewall |
| **Preset Apps** | One-click block for YouTube, TikTok, Facebook, Instagram, Netflix, Spotify, Discord, Telegram, Zoom, Reddit, Twitch, Twitter/X |
| **Auto-subdomain** | Blocking `youtube.com` automatically blocks `www.youtube.com` too |
| **Toggle Rules** | Enable/disable rules without deleting them |
| **DPI Analysis** | Upload `.pcap` files, inspect TLS SNI, classify 20+ apps |
| **Block Log** | Full history of all blocking actions |
| **Real-time Status** | Dashboard shows blocked domains, firewall rules, admin status |

---

## 3. System Requirements

| Component | Required |
|-----------|----------|
| **OS** | Windows 10 or Windows 11 |
| **Node.js** | v18+ ([download](https://nodejs.org/)) |
| **Admin rights** | Required — hosts file and firewall are protected |
| **RAM** | 512 MB minimum |
| **Disk** | 100 MB |

| Component | Optional |
|-----------|----------|
| **C++ compiler** | Only if you want to build the DPI engine for PCAP analysis |
| **MongoDB** | Only for persistent report storage |

---

## 4. Complete Setup Guide (Step-by-Step)

### Step 1: Install Node.js

```powershell
# Download from https://nodejs.org/ (LTS version), then verify:
node --version
npm --version
```

### Step 2: Open PowerShell as Administrator

> **This is critical.** Without admin, the hosts file and firewall cannot be modified.

1. Press `Win` key
2. Type `powershell`
3. Right-click **Windows PowerShell** → **Run as Administrator**
4. Click **Yes** on the UAC prompt

### Step 3: Navigate to the Project

```powershell
cd "C:\Projects Placements\DPI-Modified\Packet_analyzer"
```

### Step 4: Install Backend Dependencies

```powershell
cd backend
npm install
cd ..
```

### Step 5: Install Frontend Dependencies

```powershell
cd frontend
npm install
cd ..
```

### Step 6: Build the Frontend

```powershell
cd frontend
npm run build
cd ..
```

### Step 7: Start the Backend (Admin Terminal)

In the **same Admin PowerShell** you opened in Step 2:

```powershell
cd backend
node src/server.js
```

You should see:
```
DPI Blocker backend running on http://localhost:3001
Blocking API: /api/rules, /api/status, /api/logs
Analysis API: /api/upload, /api/reports
```

**Keep this terminal open.** The backend must stay running.

### Step 8: Start the Frontend (Separate Terminal)

Open a **second PowerShell** (regular — does not need to be Admin):

```powershell
cd "C:\Projects Placements\DPI-Modified\Packet_analyzer\frontend"
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 9: Open the Dashboard

Open your browser and go to **http://localhost:5173**

You should see the DPI Blocker dashboard with a sidebar navigation on the left.

### Step 10: Block Your First Website

1. Click **Blocking Rules** in the sidebar
2. Click **Block YouTube** (or type `youtube.com` in the domain field and press Enter)
3. You should see a green success message

### Step 11: Flush DNS Cache

Open a **third PowerShell** (Admin) and run:

```powershell
ipconfig /flushdns
```

### Step 12: Verify the Block

Test in PowerShell:

```powershell
Invoke-WebRequest -Uri "https://www.youtube.com" -TimeoutSec 5 -UseBasicParsing
```

If the block is working, you will see a red error like:
```
Invoke-WebRequest : The remote name could not be resolved
```

### Step 13: Test in Your Browser

1. **Close ALL browser windows completely** (Chrome, Edge, Firefox — all of them)
2. Reopen a browser
3. Go to `youtube.com`
4. You should see **"This site can't be reached"** or similar error

> If YouTube still opens, see [Troubleshooting: Blocking not working](#blocking-not-working-websites-still-open).

---

## 5. How to Use the Web Dashboard

### Dashboard (Home)

Shows real-time system status:

| Card | Meaning |
|------|---------|
| Domains Blocked | Number of domains in the hosts file |
| Active Rules | Enabled blocking rules |
| Firewall Rules | Windows Firewall rules created |
| Admin Status | Green = running as admin, Yellow = limited |

### Blocking Rules Page

**Quick Block** — Click preset buttons to instantly block popular apps.

**Custom Domain Block:**
1. Type a domain (e.g., `reddit.com`)
2. Press Enter
3. Both `reddit.com` and `www.reddit.com` are added to hosts file
4. DNS cache is flushed automatically

**IP Block:**
1. Type an IP (e.g., `192.168.1.50`)
2. Press Enter
3. Windows Firewall outbound rule is created

**Port Block:**
1. Type a port number (e.g., `443`)
2. Press Enter
3. TCP + UDP firewall rules are created

**Managing Rules:**
- Toggle icon → Enable/disable a rule
- Trash icon → Delete a rule and unblock it

### DPI Analyzer Page

1. Drag & drop a `.pcap` file onto the upload zone
2. Optionally configure test blocking rules
3. Click **Analyze Packet Capture**
4. View results: metric cards, pie chart (apps), bar chart (protocols), detected domains, blocked connections

### Block Log Page

Chronological history of all blocking actions. Filter by type (domain, IP, port).

### Settings Page

System status, admin instructions, and how blocking works.

---

## 6. How Blocking Works

### Domain Blocking (Hosts File)

When you block `youtube.com`:

```
1. Backend writes to C:\Windows\System32\drivers\etc\hosts:

   127.0.0.1 youtube.com # DPI-BLOCKER
   ::1 youtube.com # DPI-BLOCKER
   127.0.0.1 www.youtube.com # DPI-BLOCKER
   ::1 www.youtube.com # DPI-BLOCKER

2. DNS cache is flushed (ipconfig /flushdns)

3. Browser tries to visit youtube.com:
   → OS checks hosts file → finds 127.0.0.1
   → Connects to 127.0.0.1 → no server running there → connection fails
   → Browser shows "This site can't be reached"
```

> **Key detail:** Both `youtube.com` AND `www.youtube.com` are blocked automatically because browsers typically visit `www.youtube.com` which resolves to different IPs than the bare domain.

### IP/Port Blocking (Windows Firewall)

When you block IP `192.168.1.50`:

```
netsh advfirewall firewall add rule name="DPI-Block-IP-192.168.1.50" dir=out remoteip="192.168.1.50" action=block
```

This creates a Windows Firewall outbound rule that drops all packets to that IP.

### Why Admin Rights Are Needed

| Operation | File/API | Why Admin |
|-----------|----------|-----------|
| Domain blocking | `C:\Windows\System32\drivers\etc\hosts` | Protected by Windows |
| IP/Port blocking | `netsh advfirewall` | Requires elevation |
| DNS flush | `ipconfig /flushdns` | Requires elevation |

**Without admin:** The web UI works but rules are NOT applied to the system.

---

## 7. DPI Analysis (PCAP Upload)

### What is Deep Packet Inspection?

DPI looks inside network packets. Even with HTTPS encryption, the first packet (TLS Client Hello) contains the domain name in plaintext via the **Server Name Indication (SNI)** field.

```
TLS Client Hello (visible in plaintext):
┌──────────────────────────────────────┐
│ Content Type: 0x16 (Handshake)       │
│ Handshake Type: 0x01 (Client Hello)  │
│ ...                                  │
│ Extensions:                          │
│   SNI: "www.youtube.com"  ← EXTRACT │
└──────────────────────────────────────┘
```

### What the Engine Detects

| Protocol | Extracted Data |
|----------|---------------|
| HTTPS (TLS) | SNI (domain name) |
| HTTP | Host header |
| DNS | Queried domain |
| QUIC | SNI (simplified) |

### Supported Applications (22+)

YouTube, Facebook, TikTok, Twitter/X, Instagram, Netflix, Spotify, Discord, Telegram, Zoom, WhatsApp, GitHub, Amazon, Microsoft, Apple, Google, Cloudflare, and more.

### Standalone Usage

```powershell
# Build the DPI engine (requires g++ with C++17)
g++ -std=c++17 -pthread -O2 -I include -o dpi_engine.exe src/dpi_mt.cpp src/pcap_reader.cpp src/packet_parser.cpp src/sni_extractor.cpp src/types.cpp

# Analyze a capture
.\dpi_engine.exe input.pcap output.pcap --json

# With blocking rules
.\dpi_engine.exe input.pcap output.pcap --block-app YouTube --block-domain facebook

# Generate test data
python generate_test_pcap.py
```

---

## 8. API Reference

All endpoints at `http://localhost:3001/api/`.

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | `{status: "ok", timestamp}` |
| GET | `/api/status` | Admin access, hosts file status, blocked domains list |

### Rules

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/rules` | — | List all rules |
| POST | `/api/rules` | `{type, value, category}` | Add rule (type: domain/ip/port) |
| PUT | `/api/rules/:id` | `{enabled: bool}` | Toggle rule |
| DELETE | `/api/rules/:id` | — | Delete rule and unblock |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs?limit=100` | Block history |

### DPI Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload `.pcap` (multipart form) |
| GET | `/api/reports` | List reports |
| GET | `/api/reports/:id` | Get report |

### Example: Block via API

```powershell
$headers = @{'Content-Type' = 'application/json'}
$body = '{"type":"domain","value":"tiktok.com"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/rules" -Method Post -Headers $headers -Body $body
```

---

## 9. Project Structure

```
Packet_analyzer/
├── backend/                        # Node.js Express API server
│   ├── package.json                # express, multer, cors, dotenv
│   ├── .env                        # PORT=3001, DPI_BINARY, etc.
│   ├── data/
│   │   ├── rules.json              # All blocking rules (JSON)
│   │   └── block-log.json          # Block history (JSON)
│   ├── uploads/                    # Uploaded PCAP files
│   └── src/
│       ├── server.js               # Express server + all routes
│       ├── routes/
│       │   └── analyze.js          # PCAP upload + analysis
│       └── services/
│           ├── blocker.js          # Hosts file + Windows Firewall mgmt
│           ├── database.js         # JSON file CRUD
│           ├── dpiRunner.js        # Spawns C++ DPI engine
│           └── reportService.js    # MongoDB report ops
│
├── frontend/                       # React 19 web UI
│   ├── package.json                # react, recharts, lucide-react
│   ├── vite.config.js              # Vite + Tailwind + API proxy
│   ├── dist/                       # Production build output
│   └── src/
│       ├── main.jsx                # React entry
│       ├── App.jsx                 # Layout with sidebar + page routing
│       ├── index.css               # Tailwind CSS
│       ├── api/
│       │   └── client.js           # All API calls
│       ├── components/
│       │   ├── Sidebar.jsx         # Navigation sidebar
│       │   ├── MetricCard.jsx      # Stat card component
│       │   ├── UploadZone.jsx      # Drag-drop file upload
│       │   └── PacketChart.jsx     # Pie + bar charts
│       └── pages/
│           ├── DashboardPage.jsx   # Status dashboard
│           ├── RulesPage.jsx       # Rule management
│           ├── AnalyzerPage.jsx    # DPI PCAP analysis
│           ├── LogPage.jsx         # Block history
│           └── SettingsPage.jsx    # System status
│
├── include/                        # C++ DPI engine headers
│   ├── types.h                     # FiveTuple, AppType, Connection
│   ├── pcap_reader.h               # PCAP file reading
│   ├── packet_parser.h             # Ethernet/IP/TCP/UDP parsing
│   ├── sni_extractor.h             # TLS SNI + HTTP Host extraction
│   ├── rule_manager.h              # Thread-safe blocking rules
│   ├── connection_tracker.h        # Per-flow state tracking
│   ├── fast_path.h                 # Fast Path processor thread
│   ├── load_balancer.h             # Load Balancer thread
│   ├── dpi_engine.h                # Main DPI orchestrator
│   └── thread_safe_queue.h         # Thread-safe queue
│
├── src/                            # C++ DPI engine implementation
│   ├── dpi_mt.cpp                  # Multi-threaded engine (main)
│   ├── pcap_reader.cpp             # PCAP reader
│   ├── packet_parser.cpp           # Protocol parser
│   ├── sni_extractor.cpp           # SNI/Host/DNS extraction
│   ├── types.cpp                   # App type classification
│   ├── rule_manager.cpp            # Rule management
│   ├── connection_tracker.cpp      # Flow tracking
│   ├── fast_path.cpp               # FP thread
│   ├── load_balancer.cpp           # LB thread
│   └── main_working.cpp            # Simple single-threaded version
│
├── dpi_engine.exe                  # Compiled multi-threaded engine
├── dpi_daemon.exe                  # Live blocking daemon
├── generate_test_pcap.py           # Creates test_dpi.pcap
├── test_dpi.pcap                   # Sample capture (16 TLS, 2 HTTP, 4 DNS)
├── start.bat                       # Launch both frontend + backend
├── start-backend.bat               # Launch backend only
├── start-frontend.bat              # Launch frontend only
└── README.md                       # This file
```

---

## 10. Architecture

### System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        Your Browser                                │
│                  http://localhost:5173                              │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ React 19 + Tailwind CSS 4 + Recharts + Lucide Icons         │  │
│  │                                                              │  │
│  │ Sidebar: Dashboard │ Rules │ Analyzer │ Log │ Settings       │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────────┘
                              │  /api/* (fetch calls)
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                     Vite Dev Server (port 5173)                    │
│                  Proxies /api → localhost:3001                     │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                   Express Server (port 3001)                       │
│                                                                    │
│  Routes:                                                           │
│  ├── GET  /api/health       → Health check                        │
│  ├── GET  /api/status       → System status (admin, hosts, FW)   │
│  ├── GET  /api/rules        → List blocking rules                 │
│  ├── POST /api/rules        → Add rule → applies to system        │
│  ├── PUT  /api/rules/:id    → Toggle rule on/off                  │
│  ├── DELETE /api/rules/:id  → Delete rule → removes from system   │
│  ├── GET  /api/logs         → Block history                       │
│  ├── POST /api/upload       → Upload PCAP → spawn C++ engine      │
│  ├── GET  /api/reports      → List analysis reports               │
│  └── GET  /api/reports/:id  → Get specific report                 │
│                                                                    │
│  Services:                                                         │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ blocker.js      │  │ database.js  │  │ dpiRunner.js         │  │
│  │                 │  │              │  │                      │  │
│  │ • blockDomain() │  │ • getRules() │  │ • runDpiAnalysis()   │  │
│  │ • unblockDomain│  │ • addRule()  │  │ • Spawns dpi_engine  │  │
│  │ • blockIp()    │  │ • update()   │  │ • Parses JSON output │  │
│  │ • unblockIp()  │  │ • delete()   │  │                      │  │
│  │ • blockPort()  │  │ • getLogs()  │  │                      │  │
│  │ • unblockPort()│  │              │  │                      │  │
│  │ • getStatus()  │  │ Storage:     │  │                      │  │
│  │                │  │ data/*.json  │  │                      │  │
│  └───────┬────────┘  └──────────────┘  └──────────┬───────────┘  │
└──────────┼─────────────────────────────────────────┼──────────────┘
           │                                         │
           ▼                                         ▼
┌──────────────────────────┐          ┌──────────────────────────────┐
│ Windows System            │          │ C++ DPI Engine (dpi_engine)  │
│                           │          │                              │
│ Hosts File:               │          │ Input: .pcap file            │
│ C:\Windows\...\hosts      │          │ Output: .pcap + JSON report  │
│                           │          │                              │
│ 127.0.0.1 youtube.com     │          │ Pipeline:                    │
│ 127.0.0.1 www.youtube.com │          │ Reader → Load Balancers      │
│ ::1 youtube.com           │          │   → Fast Paths (DPI)         │
│ ::1 www.youtube.com       │          │   → Output Writer            │
│                           │          │                              │
│ Windows Firewall:         │          │ Features:                    │
│ netsh advfirewall         │          │ • TLS SNI extraction         │
│                           │          │ • HTTP Host extraction       │
│ Outbound rules:           │          │ • DNS query extraction       │
│ • Block IP x.x.x.x       │          │ • QUIC detection             │
│ • Block port 443 (TCP+UDP)│          │ • 22+ app classifications    │
└──────────────────────────┘          └──────────────────────────────┘
```

### Domain Blocking Flow

```
User clicks "Block YouTube" in RulesPage
         │
         ▼
Frontend: POST /api/rules { type: "domain", value: "youtube.com" }
         │
         ▼
Backend server.js:
  1. addRule("domain", "youtube.com") → saves to data/rules.json
  2. blocker.blockDomain("youtube.com")
         │
         ▼
Blocker service (blocker.js):
  1. _getDomainVariants("youtube.com") → ["youtube.com", "www.youtube.com"]
  2. For each variant:
     - Read current hosts file
     - Check if entry already exists
     - If not, append:
         127.0.0.1 youtube.com # DPI-BLOCKER
         ::1 youtube.com # DPI-BLOCKER
         127.0.0.1 www.youtube.com # DPI-BLOCKER
         ::1 www.youtube.com # DPI-BLOCKER
  3. Run: ipconfig /flushdns
  4. Return { success: true }
         │
         ▼
addLog({ action: "add", type: "domain", value: "youtube.com", status: "applied" })
         │
         ▼
Frontend: Shows green success message "Blocked youtube.com"
         │
         ▼
DNS resolution for youtube.com → 127.0.0.1
DNS resolution for www.youtube.com → 127.0.0.1
Browser connects to 127.0.0.1 → no server → "This site can't be reached"
```

### DPI Analysis Flow

```
User drops .pcap file in AnalyzerPage
         │
         ▼
Frontend: POST /api/upload (multipart: pcap file + test rules)
         │
         ▼
Backend routes/analyze.js:
  1. Save uploaded file to uploads/
  2. Build command: dpi_engine.exe input.pcap output.pcap --json
     [--block-app YouTube] [--block-domain facebook] ...
  3. Spawn C++ process, read stdout JSON
  4. Save report to MongoDB (if available)
         │
         ▼
C++ DPI Engine (dpi_mt.cpp):
  Reader Thread
    → reads each packet from .pcap
    → hashes 5-tuple → dispatches to Load Balancer
  Load Balancer Threads (2)
    → re-hashes → dispatches to Fast Path
  Fast Path Threads (4)
    → Parses Ethernet/IP/TCP/UDP headers
    → Extracts TLS SNI / HTTP Host / DNS query
    → Classifies app type (YouTube, Facebook, etc.)
    → Checks blocking rules
    → Marks packet as FORWARD or DROP
  Output Writer
    → Writes forwarded packets to output .pcap
  JSON Report
    → Total packets, forwarded, dropped
    → Protocol breakdown (TCP/UDP/other)
    → Application breakdown (YouTube 15%, Google 10%, ...)
    → Detected domains list
    → Blocked connections list
         │
         ▼
Frontend: Displays dashboard with charts, tables, metrics
```

---

## 11. Production Deployment

### Option A: Single Server (Backend Serves Frontend)

1. Build the frontend:
   ```powershell
   cd frontend && npm run build
   ```

2. Add static file serving to `backend/src/server.js`:
   ```javascript
   import path from 'path';
   import { fileURLToPath } from 'url';
   const __dirname = path.dirname(fileURLToPath(import.meta.url));

   app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
   });
   ```

3. Run only the backend:
   ```powershell
   cd backend && node src/server.js
   ```

4. Access at **http://localhost:3001**

### Option B: PM2 Process Manager

```powershell
npm install -g pm2

cd backend
pm2 start src/server.js --name dpi-blocker
pm2 save
pm2 startup
```

### Option C: Windows Service (NSSM)

```powershell
winget install nssm

nssm install DPIBlocker "C:\Program Files\nodejs\node.exe" "C:\path\to\backend\src\server.js"
nssm set DPIBlocker AppDirectory "C:\path\to\backend"
nssm set DPIBlocker Start SERVICE_AUTO_START
nssm start DPIBlocker
```

### Option D: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name dpi-blocker.local;

    location /api/ {
        proxy_pass http://localhost:3001;
    }

    location / {
        root C:\path\to\frontend\dist;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 12. Troubleshooting

### Blocking Not Working — Website Still Opens

This is the most common issue. Work through these steps in order:

**Step 1: Check admin status**

Open the web dashboard → Settings page. If "Administrator Privileges" shows **Limited**, restart the backend as Administrator.

**Step 2: Verify hosts file entry**

```powershell
Get-Content "C:\Windows\System32\drivers\etc\hosts" | Select-String "youtube"
```

If nothing shows → admin issue. If it shows `127.0.0.1 youtube.com` → proceed to Step 3.

**Step 3: Test DNS resolution**

```powershell
Resolve-DnsName -Name "www.youtube.com" | Select-Object Name, IPAddress
```

If it shows `127.0.0.1` → hosts file works. If it shows a real IP → DNS is bypassing hosts file.

**Step 4: Test from PowerShell**

```powershell
Invoke-WebRequest -Uri "https://www.youtube.com" -TimeoutSec 5 -UseBasicParsing
```

If this **fails** but the browser works → browser caching issue. Close ALL browser windows and reopen.

**Step 5: Disable DNS over HTTPS in Chrome**

1. Go to `chrome://settings/security`
2. Turn **OFF** "Use secure DNS"
3. Restart Chrome completely

**Step 6: Flush everything**

```powershell
ipconfig /flushdns
```

Then in Chrome: open `chrome://net-internals/#dns` → click **Clear host cache**, then close and reopen Chrome.

**Step 7: Try a different browser**

Test in Edge or Firefox. If it's blocked in one browser but not another → browser-specific caching.

### Port 3001 Already in Use

```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

Or change port in `backend/.env`:
```
PORT=3002
```

### npm Install Fails

```powershell
npm cache clean --force
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../frontend && rm -rf node_modules package-lock.json && npm install
```

### Frontend Shows Blank Page

1. Ensure backend is running on port 3001
2. Ensure frontend dev server is running on port 5173
3. Open browser F12 → Console tab for errors
4. Try rebuilding: `cd frontend && npm run build`

### DPI Engine Not Found

Build the C++ engine:
```powershell
g++ -std=c++17 -pthread -O2 -I include -o dpi_engine.exe src/dpi_mt.cpp src/pcap_reader.cpp src/packet_parser.cpp src/sni_extractor.cpp src/types.cpp
```

Or update the path in `backend/.env`:
```
DPI_BINARY=..\dpi_engine.exe
```

---

## 13. Technical Background

### How DPI Extracts Domains from HTTPS

Even though HTTPS encrypts the content, the **TLS Client Hello** (the very first encrypted message) contains the domain name in plaintext via the **Server Name Indication (SNI)** extension. This is by design — the server needs to know which certificate to present.

```
Browser                              Server
  │                                    │
  │ ── TCP SYN ──────────────────────► │
  │ ◄── TCP SYN-ACK ───────────────── │
  │ ── TCP ACK ──────────────────────► │
  │                                    │
  │ ── TLS Client Hello ────────────► │
  │    SNI: www.youtube.com (visible) │
  │                                    │
  │ ◄── TLS Server Hello ──────────── │
  │ ◄── Certificate ───────────────── │
  │                                    │
  │ ═══ Encrypted data ═══════════════│
```

The DPI engine reads this SNI field to identify the destination domain without decrypting anything.

### Hosts File vs DNS over HTTPS

The hosts file works at the OS level — when any application resolves a domain, Windows checks the hosts file first. However, **DNS over HTTPS (DoH)** bypasses this by resolving domains through encrypted HTTPS connections to Cloudflare/Google DNS, ignoring the hosts file entirely.

| Method | Hosts File Works? | Notes |
|--------|-------------------|-------|
| Standard DNS | Yes | Default for most setups |
| DNS over HTTPS (DoH) | No | Chrome/Firefox feature, must be disabled |
| VPN | No | VPN handles DNS separately |
| Standard browser (no DoH) | Yes | Works after DNS flush |

### Blocking Methods Comparison

| Method | Blocks At | Bypassable By | Requires Admin |
|--------|-----------|---------------|----------------|
| Hosts file | DNS resolution | VPN, DoH, cached IP | Yes |
| Windows Firewall | Network packets | VPN (different routing) | Yes |
| DPI Analysis | N/A (reporting only) | N/A | No |

---

## Commands Quick Reference

### First-Time Setup (run once)
```powershell
# In Admin PowerShell:
cd "C:\Projects Placements\DPI-Modified\Packet_analyzer\backend"
npm install

cd ..\frontend
npm install
npm run build
```

### Start the Application (every time)
```powershell
# Terminal 1 — Admin PowerShell:
cd "C:\Projects Placements\DPI-Modified\Packet_analyzer\backend"
node src/server.js

# Terminal 2 — Regular PowerShell:
cd "C:\Projects Placements\DPI-Modified\Packet_analyzer\frontend"
npm run dev
```

### Or use the shortcut
Double-click `start.bat` (right-click → Run as Administrator)

### Flush DNS after adding rules
```powershell
ipconfig /flushdns
```

### Test if blocking works
```powershell
Invoke-WebRequest -Uri "https://www.youtube.com" -TimeoutSec 5 -UseBasicParsing
```
Error = blocking works. Response = blocking not working.

### Verify hosts file
```powershell
Get-Content "C:\Windows\System32\drivers\etc\hosts" | Select-String "youtube"
```

---

&copy; 2026 DPI Website Blocker — A deep packet inspection based website blocking system for Windows.
