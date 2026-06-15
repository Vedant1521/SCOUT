# SCOUT

> Deep Packet Inspection website blocker for Windows. A full-stack web application with a Node.js backend, React frontend, and C++ DPI engine for traffic analysis.

---

## Table of Contents

- [What This Project Does](#1-what-this-project-does)
- [Features](#2-features)
- [System Requirements](#3-system-requirements)
- [Complete Setup Guide](#4-complete-setup-guide)
- [How to Use the Web Dashboard](#5-how-to-use-the-web-dashboard)
- [How Blocking Works](#6-how-blocking-works)
- [Rule Profiles](#7-rule-profiles)
- [DPI Analysis (PCAP Upload)](#8-dpi-analysis-pcap-upload)
- [API Reference](#9-api-reference)
- [Project Structure](#10-project-structure)
- [Architecture](#11-architecture)
- [Troubleshooting](#12-troubleshooting)

---

## 1. What This Project Does

**SCOUT** is a full-stack website blocker for Windows. It gives you a web dashboard to manage which websites, IPs, and ports are blocked on your device. It works in two ways:

1. **Live Blocking** — Adds entries to the Windows hosts file and Windows Firewall rules in real-time from the web UI. Also blocks DNS-over-HTTPS resolvers to prevent browser bypass.
2. **DPI Analysis** — Upload `.pcap` network captures and the C++ engine inspects TLS SNI, HTTP Host headers, and DNS queries to classify traffic.

```
┌──────────────────────────────────────────────────────┐
│  Web Dashboard (React)                               │
│  http://localhost:5173                                │
│                                                      │
│  [Dashboard] [Rules] [Profiles] [Analyzer] [Log]     │
└────────────────────┬─────────────────────────────────┘
                     │  API calls
                     ▼
┌──────────────────────────────────────────────────────┐
│  Backend (Node.js + Express)                         │
│  http://localhost:3001                                │
│                                                      │
│  /api/rules     → Manage blocking rules              │
│  /api/profiles  → Rule profiles management           │
│  /api/status    → System health check                │
│  /api/upload    → PCAP analysis                      │
│  /api/logs      → Block history                      │
└────────┬─────────────────┬───────────────────────────┘
         │                 │
         ▼                 ▼
┌────────────────┐  ┌──────────────────────────────┐
│ Hosts File     │  │ C++ DPI Engine               │
│ + Firewall     │  │ (PCAP analysis only)         │
│ + DoH Block    │  │                              │
└────────────────┘  └──────────────────────────────┘
```

---

## 2. Features

| Category | Feature |
|----------|---------|
| **Domain Blocking** | Block websites via Windows hosts file — instant, system-wide |
| **IP Blocking** | Block IPs via Windows Firewall outbound rules |
| **Port Blocking** | Block ports (TCP + UDP) via Windows Firewall |
| **Dual-Layer Blocking** | Hosts file + Firewall IP rules for instant re-blocking |
| **DoH Blocking** | Blocks DNS-over-HTTPS resolvers (Cloudflare, Google, Quad9, OpenDNS) to prevent browser bypass |
| **Rule Profiles** | Save, activate, and deactivate blocking presets (Work Mode, Gaming Mode, Kid Safe, Minimal) |
| **Preset Apps** | One-click block for YouTube, TikTok, Facebook, Instagram, Netflix, Spotify, Discord, Telegram, Zoom, Reddit, Twitch, Twitter/X |
| **Auto-subdomain** | Blocking `youtube.com` automatically blocks `www.youtube.com` too |
| **Toggle Rules** | Enable/disable rules without deleting them |
| **DPI Analysis** | Upload `.pcap` files, inspect TLS SNI, classify 20+ apps |
| **Block Log** | Full history of all blocking actions with search and pagination |
| **Real-time Status** | Dashboard shows blocked domains, firewall rules, admin status |
| **Dark/Light Theme** | Toggle between dark and light mode with smooth transitions |
| **Modern UI** | Geist Sans/Mono fonts, glass morphism design, responsive layout |
| **Toast Notifications** | Floating success/error/info toasts for all actions |
| **Confirmation Dialogs** | Prevent accidental deletions with modal confirmations |
| **Live Auto-refresh** | Dashboard auto-refreshes every 5 seconds |
| **Search & Filter** | Search rules, logs, and filter by type |
| **Auto Admin Elevation** | `start.bat` auto-requests UAC elevation for full functionality |

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

---

## 4. Complete Setup Guide

### Step 1: Install Node.js

```powershell
# Download from https://nodejs.org/ (LTS version), then verify:
node --version
npm --version
```

### Step 2: Navigate to the Project

```powershell
cd "C:\Projects Placements\DPI-Modified\Packet_analyzer"
```

### Step 3: Install Dependencies

```powershell
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Step 4: Start the Application

**Easiest method** — double-click `start.bat` (it auto-requests admin privileges):

```
Right-click start.bat → Run as administrator
```

Or if the UAC prompt appears, click **Yes**.

**Manual method** — two terminals:

```powershell
# Terminal 1 (Admin):
cd "C:\Projects Placements\DPI-Modified\Packet_analyzer\backend"
node src/server.js

# Terminal 2 (Regular):
cd "C:\Projects Placements\DPI-Modified\Packet_analyzer\frontend"
npm run dev
```

### Step 5: Open the Dashboard

Open your browser and go to **http://localhost:5173**

### Step 6: Block Your First Website

1. Click **Rules** in the sidebar
2. Type `youtube.com` in the domain field and press Enter
3. Or click a preset button (YouTube, Facebook, etc.)

### Step 7: Verify the Block

1. **Close ALL browser windows completely**
2. Reopen a browser
3. Go to `youtube.com`
4. You should see **"This site can't be reached"**

> **Important:** If the site still opens after re-blocking, it's due to browser DNS caching. SCOUT automatically blocks DNS-over-HTTPS resolvers to prevent this. If issues persist, disable "Use secure DNS" in Chrome at `chrome://settings/security`.

---

## 5. How to Use the Web Dashboard

### Dashboard (Home)

Shows real-time system status with auto-refresh every 5 seconds:

| Card | Meaning |
|------|---------|
| Domains Blocked | Number of domains in the hosts file |
| Active Rules | Enabled blocking rules |
| Firewall Rules | Windows Firewall rules created |
| Admin Status | Running as admin or limited |

If not running as admin, a warning banner is displayed with instructions to restart.

### Blocking Rules Page

**Quick Block** — Click preset buttons to instantly block popular apps.

**Custom Domain Block:**
1. Type a domain (e.g., `reddit.com`)
2. Press Enter
3. Both `reddit.com` and `www.reddit.com` are blocked automatically
4. DNS cache is flushed automatically
5. Domain IPs are resolved and blocked via firewall
6. DoH resolvers are blocked to prevent browser bypass

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
- Search bar → Filter rules by value

### Rule Profiles Page

Save and switch between blocking configurations:

- **Create Profile** — Select rules to include, give it a name
- **Save Current** — Save your current active rules as a new profile
- **Activate** — Applies the profile's rules (disables all previous rules first)
- **Deactivate** — Removes the profile's rules from the system

Built-in profiles:
| Profile | Description |
|---------|-------------|
| Work Mode | Blocks social media and distractions |
| Gaming Mode | Blocks background updaters |
| Kid Safe | Blocks social media for children |
| Minimal | Only blocks known ad trackers |

Active profile is indicated with a green border and "Active" badge.

### DPI Analyzer Page

1. Drag & drop a `.pcap` file onto the upload zone
2. Optionally configure test blocking rules
3. Click **Analyze Packet Capture**
4. View results: metric cards, pie chart (apps), bar chart (protocols), detected domains, blocked connections

### Block Log Page

Chronological history of all blocking actions. Features:
- Search by domain/IP/port
- Filter by action type
- Pagination for large logs

### Settings Page

System status display:
- Administrator privileges status
- Hosts file access
- Windows Firewall status
- Number of blocked domains and firewall rules
- How blocking works documentation
- Run as Administrator instructions

---

## 6. How Blocking Works

### Domain Blocking (Hosts File + Firewall + DoH Block)

When you block `youtube.com`, SCOUT applies three layers:

```
Layer 1 — Hosts File:
  127.0.0.1 youtube.com # DPI-BLOCKER
  ::1 youtube.com # DPI-BLOCKER
  127.0.0.1 www.youtube.com # DPI-BLOCKER
  ::1 www.youtube.com # DPI-BLOCKER

Layer 2 — Firewall IP Rules:
  Resolves youtube.com → 192.178.211.190, etc.
  netsh advfirewall firewall add rule
    name="DPI-Block-Domain-youtube_com-192_178_211_190"
    dir=out remoteip="192.178.211.190" action=block

Layer 3 — DoH Resolver Blocking:
  Blocks Cloudflare (1.1.1.1, 1.0.0.1)
  Blocks Google (8.8.8.8, 8.8.4.4)
  Blocks Quad9 (9.9.9.9, 149.112.112.112)
  Blocks OpenDNS (208.67.222.222, 208.67.220.220)
  → Forces browsers to use system DNS → hosts file → blocked
```

**Why three layers?**
- Hosts file blocks DNS resolution
- Firewall blocks the actual IP connection (prevents cached DNS bypass)
- DoH blocking prevents browsers from bypassing the hosts file entirely

### IP/Port Blocking (Windows Firewall)

```powershell
netsh advfirewall firewall add rule name="DPI-Block-IP-192.168.1.50" dir=out remoteip="192.168.1.50" action=block
```

### Why Admin Rights Are Needed

| Operation | File/API | Why Admin |
|-----------|----------|-----------|
| Domain blocking | `C:\Windows\System32\drivers\etc\hosts` | Protected by Windows |
| IP/Port blocking | `netsh advfirewall` | Requires elevation |
| DoH blocking | `netsh advfirewall` | Requires elevation |
| DNS flush | `ipconfig /flushdns` | Works without admin |

**Without admin:** Hosts file blocking works but firewall rules (IP blocking, DoH blocking) are not applied. Re-blocking recently-unblocked sites may take 10-20 minutes due to browser DNS caching.

---

## 7. Rule Profiles

Profiles let you save and switch between different blocking configurations.

### How Profiles Work

**Activating a profile:**
1. Disables all currently active rules
2. Enables all rules defined in the profile
3. Adds new rules if they don't exist yet
4. Tracks the active profile (green badge)

**Deactivating a profile:**
1. Disables all rules that were part of the profile
2. Clears the active profile state

### Built-in Profiles

| Profile | Rules |
|---------|-------|
| **Work Mode** | youtube.com, facebook.com, tiktok.com, instagram.com, x.com, reddit.com, netflix.com |
| **Gaming Mode** | windowsupdate.microsoft.com, update.microsoft.com, download.microsoft.com, cdn.steampowered.com, store.epicgames.com |
| **Kid Safe** | youtube.com, tiktok.com, instagram.com, snapchat.com, discord.com, twitch.tv |
| **Minimal** | googlesyndication.com, doubleclick.net |

### Custom Profiles

1. Go to the **Profiles** page
2. Click **Create Profile**
3. Name it and select which existing rules to include
4. Click **Create**

Or click **Save Current** to save your current active rules as a new profile.

---

## 8. DPI Analysis (PCAP Upload)

### What is Deep Packet Inspection?

DPI looks inside network packets. Even with HTTPS encryption, the first packet (TLS Client Hello) contains the domain name in plaintext via the **Server Name Indication (SNI)** field.

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
```

---

## 9. API Reference

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

### Profiles

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/profiles` | — | List all profiles |
| GET | `/api/profiles/active` | — | Get currently active profile |
| GET | `/api/profiles/:id` | — | Get specific profile |
| POST | `/api/profiles` | `{name, description, rules}` | Create profile |
| PUT | `/api/profiles/:id` | `{name, description}` | Update profile |
| DELETE | `/api/profiles/:id` | — | Delete profile |
| POST | `/api/profiles/:id/activate` | — | Activate profile |
| POST | `/api/profiles/:id/deactivate` | — | Deactivate profile |
| POST | `/api/profiles/save-current` | `{name, description}` | Save current rules as profile |

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

### Example: Activate a Profile

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/profiles/builtin-work/activate" -Method Post
```

### Example: Deactivate a Profile

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/profiles/builtin-work/deactivate" -Method Post
```

---

## 10. Project Structure

```
Packet_analyzer/
├── backend/                        # Node.js Express API server
│   ├── package.json
│   ├── .env                        # PORT=3001, DPI_BINARY, etc.
│   ├── data/
│   │   ├── rules.json              # All blocking rules (JSON)
│   │   ├── block-log.json          # Block history (JSON)
│   │   └── profiles.json           # Rule profiles (JSON)
│   ├── uploads/                    # Uploaded PCAP files
│   └── src/
│       ├── server.js               # Express server + all routes
│       ├── routes/
│       │   ├── analyze.js          # PCAP upload + analysis
│       │   ├── profiles.js         # Profile CRUD + activate/deactivate
│       │   └── auth.js             # Auth routes (unused)
│       └── services/
│           ├── blocker.js          # Hosts + Firewall + DoH blocking
│           ├── database.js         # JSON file CRUD
│           ├── profileStore.js     # Profile JSON CRUD + active tracking
│           ├── dpiRunner.js        # Spawns C++ DPI engine
│           └── reportService.js    # Report ops
│
├── frontend/                       # React 19 web UI
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── logo.png                # App logo
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Routes: /, /dashboard, /profiles
│       ├── index.css               # Design system + theme variables
│       ├── api/
│       │   └── client.js           # All API calls
│       ├── context/
│       │   └── ThemeContext.jsx     # Dark/light theme + tick sound
│       ├── components/
│       │   ├── Sidebar.jsx         # Navigation with logo
│       │   ├── Navbar.jsx          # Landing page nav
│       │   ├── Footer.jsx          # Landing page footer
│       │   ├── MetricCard.jsx      # Stat card component
│       │   ├── UploadZone.jsx      # Drag-drop file upload
│       │   ├── PacketChart.jsx     # Pie + bar charts
│       │   ├── Toast.jsx           # Toast notification system
│       │   ├── ConfirmDialog.jsx   # Modal confirmations
│       │   └── Skeleton.jsx        # Loading skeletons
│       └── pages/
│           ├── LandingPage.jsx     # Hero + features + CTA
│           ├── DashboardPage.jsx   # Status dashboard (auto-refresh)
│           ├── RulesPage.jsx       # Rule management + presets
│           ├── ProfilesPage.jsx    # Profile management
│           ├── AnalyzerPage.jsx    # DPI PCAP analysis
│           ├── LogPage.jsx         # Block history
│           └── SettingsPage.jsx    # System status + docs
│
├── include/                        # C++ DPI engine headers
├── src/                            # C++ DPI engine implementation
├── dpi_engine.exe                  # Compiled multi-threaded engine
├── start.bat                       # Auto-elevating launcher
├── restart_backend.bat             # Backend restart helper
└── README.md
```

---

## 11. Architecture

### System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        Your Browser                                │
│                  http://localhost:5173                              │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ React 19 + Tailwind CSS 4 + Recharts + Lucide Icons         │  │
│  │ Geist Sans + Geist Mono fonts                                │  │
│  │ Dark/Light theme + Glass morphism design                     │  │
│  │                                                              │  │
│  │ Sidebar: Dashboard │ Rules │ Profiles │ Analyzer │ Log │ ... │  │
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
│  ├── GET  /api/health          → Health check                     │
│  ├── GET  /api/status          → System status                    │
│  ├── GET  /api/rules           → List blocking rules              │
│  ├── POST /api/rules           → Add rule → applies to system     │
│  ├── PUT  /api/rules/:id       → Toggle rule on/off               │
│  ├── DELETE /api/rules/:id     → Delete rule → removes from sys   │
│  ├── GET  /api/profiles        → List profiles                    │
│  ├── GET  /api/profiles/active → Get active profile               │
│  ├── POST /api/profiles/:id/activate   → Activate profile         │
│  ├── POST /api/profiles/:id/deactivate → Deactivate profile       │
│  ├── POST /api/profiles/save-current   → Save current as profile  │
│  ├── GET  /api/logs            → Block history                    │
│  ├── POST /api/upload          → Upload PCAP → spawn C++ engine   │
│  ├── GET  /api/reports         → List analysis reports            │
│  └── GET  /api/reports/:id     → Get specific report              │
│                                                                    │
│  Services:                                                         │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ blocker.js      │  │ database.js  │  │ profileStore.js      │  │
│  │                 │  │              │  │                      │  │
│  │ • blockDomain() │  │ • getRules() │  │ • getProfiles()      │  │
│  │ • unblockDomain │  │ • addRule()  │  │ • createProfile()    │  │
│  │ • blockIp()     │  │ • update()   │  │ • activateProfile()  │  │
│  │ • blockPort()   │  │ • delete()   │  │ • deactivateProfile()│  │
│  │ • _blockDoH()   │  │ • getLogs()  │  │ • getActiveProfile() │  │
│  │ • _resolveIps() │  │              │  │                      │  │
│  └───────┬────────┘  └──────────────┘  └──────────────────────┘  │
└──────────┼─────────────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────────────┐
│ Windows System                                                      │
│                                                                      │
│ Hosts File:                                                         │
│ C:\Windows\...\hosts                                                │
│ 127.0.0.1 youtube.com # DPI-BLOCKER                                 │
│ 127.0.0.1 www.youtube.com # DPI-BLOCKER                             │
│                                                                      │
│ Windows Firewall:                                                   │
│ DPI-Block-Domain-youtube_com-192_178_211_190 → Block                │
│ DPI-Block-DoH-Cloudflare-1 (1.1.1.1) → Block                       │
│ DPI-Block-DoH-Google-1 (8.8.8.8) → Block                           │
└────────────────────────────────────────────────────────────────────┘
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
  2. Add hosts file entries:
     127.0.0.1 youtube.com # DPI-BLOCKER
     ::1 youtube.com # DPI-BLOCKER
     127.0.0.1 www.youtube.com # DPI-BLOCKER
     ::1 www.youtube.com # DPI-BLOCKER
  3. Flush DNS + ARP + NetBIOS caches
  4. _resolveDomainIps("youtube.com") → ["192.178.211.190", ...]
  5. Create firewall rules for each resolved IP
  6. _blockDoH() → Block Cloudflare/Google/Quad9/OpenDNS resolvers
  7. Return { success: true, firewall: true, resolvedIps: [...] }
         │
         ▼
Browser tries to visit youtube.com:
  → DoH blocked → falls back to system DNS
  → System DNS checks hosts file → finds 127.0.0.1
  → Connects to 127.0.0.1 → no server → "This site can't be reached"
```

---

## 12. Troubleshooting

### Blocking Not Working — Website Still Opens

**Step 1: Check admin status**

Open the web dashboard → Settings page. If "Administrator Privileges" shows **Not running as Admin**, close everything and re-run `start.bat` as administrator.

**Step 2: Verify hosts file entry**

```powershell
Get-Content "C:\Windows\System32\drivers\etc\hosts" | Select-String "youtube"
```

If nothing shows → admin issue. If it shows `127.0.0.1 youtube.com` → proceed to Step 3.

**Step 3: Check firewall rules**

```powershell
netsh advfirewall firewall show rule name=all dir=out | Select-String "DPI-Block-Domain"
```

If no rules → server not running as admin. If rules exist → proceed to Step 4.

**Step 4: Check DoH blocking**

```powershell
netsh advfirewall firewall show rule name=all dir=out | Select-String "DPI-Block-DoH"
```

If no DoH rules → restart server as admin. If DoH rules exist → browser may have cached DNS.

**Step 5: Disable DNS over HTTPS in Chrome**

1. Go to `chrome://settings/security`
2. Turn **OFF** "Use secure DNS"
3. Close and reopen Chrome completely

**Step 6: Flush everything**

```powershell
ipconfig /flushdns
```

Then in Chrome: open `chrome://net-internals/#dns` → click **Clear host cache**, then close and reopen Chrome.

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

---

## Commands Quick Reference

### Start the Application
```
Right-click start.bat → Run as administrator
```

### Manual Start
```powershell
# Terminal 1 (Admin):
cd "C:\Projects Placements\DPI-Modified\Packet_analyzer\backend"
node src/server.js

# Terminal 2 (Regular):
cd "C:\Projects Placements\DPI-Modified\Packet_analyzer\frontend"
npm run dev
```

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

### Check firewall rules
```powershell
netsh advfirewall firewall show rule name=all dir=out | Select-String "DPI-Block"
```

---

&copy; 2026 SCOUT — A deep packet inspection based website blocking system for Windows.
