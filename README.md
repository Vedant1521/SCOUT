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
- [Networking Background](#8-networking-background)
- [DPI Analysis (PCAP Upload)](#9-dpi-analysis-pcap-upload)
- [The Journey of a Packet](#10-the-journey-of-a-packet)
- [Multi-threaded DPI Architecture](#11-multi-threaded-dpi-architecture)
- [Deep Dive: Each Component](#12-deep-dive-each-component)
- [How SNI Extraction Works](#13-how-sni-extraction-works)
- [API Reference](#14-api-reference)
- [Project Structure](#15-project-structure)
- [Architecture](#16-architecture)
- [Troubleshooting](#17-troubleshooting)
- [Extending the Project](#18-extending-the-project)

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

## 8. Networking Background

### The Network Stack (Layers)

When you visit a website, data travels through multiple "layers":

```
┌─────────────────────────────────────────────────────────┐
│ Layer 7: Application    │ HTTP, TLS, DNS               │
├─────────────────────────────────────────────────────────┤
│ Layer 4: Transport      │ TCP (reliable), UDP (fast)   │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Network        │ IP addresses (routing)       │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Data Link      │ MAC addresses (local network)│
└─────────────────────────────────────────────────────────┘
```

### A Packet's Structure

Every network packet is like a **Russian nesting doll** — headers wrapped inside headers:

```
┌──────────────────────────────────────────────────────────────────┐
│ Ethernet Header (14 bytes)                                       │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ IP Header (20 bytes)                                         │ │
│ │ ┌──────────────────────────────────────────────────────────┐ │ │
│ │ │ TCP Header (20 bytes)                                    │ │ │
│ │ │ ┌──────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Payload (Application Data)                           │ │ │ │
│ │ │ │ e.g., TLS Client Hello with SNI                      │ │ │ │
│ │ │ └──────────────────────────────────────────────────────┘ │ │ │
│ │ └──────────────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### The Five-Tuple

A **connection** (or "flow") is uniquely identified by 5 values:

| Field | Example | Purpose |
|-------|---------|---------|
| Source IP | 192.168.1.100 | Who is sending |
| Destination IP | 172.217.14.206 | Where it's going |
| Source Port | 54321 | Sender's application identifier |
| Destination Port | 443 | Service being accessed (443 = HTTPS) |
| Protocol | TCP (6) | TCP or UDP |

**Why is this important?**
- All packets with the same 5-tuple belong to the same connection
- If we block one packet of a connection, we should block all of them
- This is how we "track" conversations between computers

### What is SNI?

**Server Name Indication (SNI)** is part of the TLS/HTTPS handshake. When you visit `https://www.youtube.com`:

1. Your browser sends a "Client Hello" message
2. This message includes the domain name in **plaintext** (not encrypted yet!)
3. The server uses this to know which certificate to send

```
TLS Client Hello:
├── Version: TLS 1.2
├── Random: [32 bytes]
├── Cipher Suites: [list]
└── Extensions:
    └── SNI Extension:
        └── Server Name: "www.youtube.com"  ← We extract THIS!
```

**This is the key to DPI**: Even though HTTPS is encrypted, the domain name is visible in the first packet!

### What is Deep Packet Inspection?

**Deep Packet Inspection (DPI)** is a technology used to examine the contents of network packets as they pass through a checkpoint. Unlike simple firewalls that only look at packet headers (source/destination IP), DPI looks *inside* the packet payload.

**Real-World Uses:**
- **ISPs**: Throttle or block certain applications (e.g., BitTorrent)
- **Enterprises**: Block social media on office networks
- **Parental Controls**: Block inappropriate websites
- **Security**: Detect malware or intrusion attempts

**What SCOUT's DPI Engine Does:**
```
User Traffic (PCAP) → [DPI Engine] → Filtered Traffic (PCAP)
                           ↓
                    - Identifies apps (YouTube, Facebook, etc.)
                    - Blocks based on rules
                    - Generates reports
```

---

## 9. DPI Analysis (PCAP Upload)

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

## 10. The Journey of a Packet

Let's trace a single packet through the DPI engine:

### Step 1: Read PCAP File

```cpp
PcapReader reader;
reader.open("capture.pcap");
```

**What happens:**
1. Open the file in binary mode
2. Read the 24-byte global header (magic number, version, etc.)
3. Verify it's a valid PCAP file

**PCAP File Format:**
```
┌────────────────────────────┐
│ Global Header (24 bytes)   │  ← Read once at start
├────────────────────────────┤
│ Packet Header (16 bytes)   │  ← Timestamp, length
│ Packet Data (variable)     │  ← Actual network bytes
├────────────────────────────┤
│ Packet Header (16 bytes)   │
│ Packet Data (variable)     │
├────────────────────────────┤
│ ... more packets ...       │
└────────────────────────────┘
```

### Step 2: Read Each Packet

```cpp
while (reader.readNextPacket(raw)) {
    // raw.data contains the packet bytes
    // raw.header contains timestamp and length
}
```

**What happens:**
1. Read 16-byte packet header
2. Read N bytes of packet data (N = header.incl_len)
3. Return false when no more packets

### Step 3: Parse Protocol Headers

```cpp
PacketParser::parse(raw, parsed);
```

**What happens:**

```
raw.data bytes:
[0-13]   Ethernet Header
[14-33]  IP Header
[34-53]  TCP Header
[54+]    Payload

After parsing:
parsed.src_mac  = "00:11:22:33:44:55"
parsed.dest_mac = "aa:bb:cc:dd:ee:ff"
parsed.src_ip   = "192.168.1.100"
parsed.dest_ip  = "172.217.14.206"
parsed.src_port = 54321
parsed.dest_port = 443
parsed.protocol = 6 (TCP)
parsed.has_tcp  = true
```

**Parsing the Ethernet Header (14 bytes):**
```
Bytes 0-5:   Destination MAC
Bytes 6-11:  Source MAC
Bytes 12-13: EtherType (0x0800 = IPv4)
```

**Parsing the IP Header (20+ bytes):**
```
Byte 0:      Version (4 bits) + Header Length (4 bits)
Byte 8:      TTL (Time To Live)
Byte 9:      Protocol (6=TCP, 17=UDP)
Bytes 12-15: Source IP
Bytes 16-19: Destination IP
```

**Parsing the TCP Header (20+ bytes):**
```
Bytes 0-1:   Source Port
Bytes 2-3:   Destination Port
Bytes 4-7:   Sequence Number
Bytes 8-11:  Acknowledgment Number
Byte 12:     Data Offset (header length)
Byte 13:     Flags (SYN, ACK, FIN, etc.)
```

### Step 4: Create Five-Tuple and Look Up Flow

```cpp
FiveTuple tuple;
tuple.src_ip = parseIP(parsed.src_ip);
tuple.dst_ip = parseIP(parsed.dest_ip);
tuple.src_port = parsed.src_port;
tuple.dst_port = parsed.dest_port;
tuple.protocol = parsed.protocol;

Flow& flow = flows[tuple];  // Get or create
```

**What happens:**
- The flow table is a hash map: `FiveTuple → Flow`
- If this 5-tuple exists, we get the existing flow
- If not, a new flow is created
- All packets with the same 5-tuple share the same flow

### Step 5: Extract SNI (Deep Packet Inspection)

```cpp
// For HTTPS traffic (port 443)
if (pkt.tuple.dst_port == 443 && pkt.payload_length > 5) {
    auto sni = SNIExtractor::extract(payload, payload_length);
    if (sni) {
        flow.sni = *sni;                    // "www.youtube.com"
        flow.app_type = sniToAppType(*sni); // AppType::YOUTUBE
    }
}
```

**What happens in the SNI extractor:**

1. **Check if it's a TLS Client Hello:**
   ```
   Byte 0: Content Type = 0x16 (Handshake) ✓
   Byte 5: Handshake Type = 0x01 (Client Hello) ✓
   ```

2. **Navigate to Extensions:**
   ```
   Skip: Version, Random, Session ID, Cipher Suites, Compression
   ```

3. **Find SNI Extension (type 0x0000):**
   ```
   Extension Type: 0x0000 (SNI)
   Extension Length: N
   SNI List Length: M
   SNI Type: 0x00 (hostname)
   SNI Length: L
   SNI Value: "www.youtube.com"  ← FOUND!
   ```

4. **Map SNI to App Type:**
   ```cpp
   // In types.cpp
   if (sni.find("youtube") != std::string::npos) {
       return AppType::YOUTUBE;
   }
   ```

### Step 6: Check Blocking Rules

```cpp
if (rules.isBlocked(tuple.src_ip, flow.app_type, flow.sni)) {
    flow.blocked = true;
}
```

**What happens:**
```cpp
// Check IP blacklist
if (blocked_ips.count(src_ip)) return true;

// Check app blacklist
if (blocked_apps.count(app)) return true;

// Check domain blacklist (substring match)
for (const auto& dom : blocked_domains) {
    if (sni.find(dom) != std::string::npos) return true;
}

return false;
```

### Step 7: Forward or Drop

```cpp
if (flow.blocked) {
    dropped++;
    // Don't write to output
} else {
    forwarded++;
    // Write packet to output file
    output.write(packet_header);
    output.write(packet_data);
}
```

### Step 8: Generate Report

After processing all packets:
```cpp
// Count apps
for (const auto& [tuple, flow] : flows) {
    app_stats[flow.app_type]++;
}

// Print report
"YouTube: 150 packets (15%)"
"Facebook: 80 packets (8%)"
...
```

### Flow-Based Blocking

**Important:** DPI blocks at the *flow* level, not packet level.

```
Connection to YouTube:
  Packet 1 (SYN)           → No SNI yet, FORWARD
  Packet 2 (SYN-ACK)       → No SNI yet, FORWARD
  Packet 3 (ACK)           → No SNI yet, FORWARD
  Packet 4 (Client Hello)  → SNI: www.youtube.com
                           → App: YOUTUBE (blocked!)
                           → Mark flow as BLOCKED
                           → DROP this packet
  Packet 5 (Data)          → Flow is BLOCKED → DROP
  Packet 6 (Data)          → Flow is BLOCKED → DROP
  ...all subsequent packets → DROP
```

**Why this approach?**
- We can't identify the app until we see the Client Hello
- Once identified, we block all future packets of that flow
- The connection will fail/timeout on the client

---

## 11. Multi-threaded DPI Architecture

The multi-threaded version (`dpi_mt.cpp`) adds **parallelism** for high performance:

### Architecture Overview

```
                    ┌─────────────────┐
                    │  Reader Thread  │
                    │  (reads PCAP)   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │      hash(5-tuple) % 2      │
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │  LB0 Thread     │           │  LB1 Thread     │
    │  (Load Balancer)│           │  (Load Balancer)│
    └────────┬────────┘           └────────┬────────┘
             │                             │
      ┌──────┴──────┐               ┌──────┴──────┐
      │hash % 2     │               │hash % 2     │
      ▼             ▼               ▼             ▼
┌──────────┐ ┌──────────┐   ┌──────────┐ ┌──────────┐
│FP0 Thread│ │FP1 Thread│   │FP2 Thread│ │FP3 Thread│
│(Fast Path)│ │(Fast Path)│   │(Fast Path)│ │(Fast Path)│
└─────┬────┘ └─────┬────┘   └─────┬────┘ └─────┬────┘
      │            │              │            │
      └────────────┴──────────────┴────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Output Queue        │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Output Writer Thread │
              │  (writes to PCAP)     │
              └───────────────────────┘
```

### Why This Design?

1. **Load Balancers (LBs):** Distribute work across FPs
2. **Fast Paths (FPs):** Do the actual DPI processing
3. **Consistent Hashing:** Same 5-tuple always goes to same FP

**Why consistent hashing matters:**
```
Connection: 192.168.1.100:54321 → 142.250.185.206:443

Packet 1 (SYN):         hash → FP2
Packet 2 (SYN-ACK):     hash → FP2  (same FP!)
Packet 3 (Client Hello): hash → FP2  (same FP!)
Packet 4 (Data):        hash → FP2  (same FP!)

All packets of this connection go to FP2.
FP2 can track the flow state correctly.
```

### Detailed Flow

**Step 1: Reader Thread**
```cpp
// Main thread reads PCAP
while (reader.readNextPacket(raw)) {
    Packet pkt = createPacket(raw);

    // Hash to select Load Balancer
    size_t lb_idx = hash(pkt.tuple) % num_lbs;

    // Push to LB's queue
    lbs_[lb_idx]->queue().push(pkt);
}
```

**Step 2: Load Balancer Thread**
```cpp
void LoadBalancer::run() {
    while (running_) {
        // Pop from my input queue
        auto pkt = input_queue_.pop();

        // Hash to select Fast Path
        size_t fp_idx = hash(pkt.tuple) % num_fps_;

        // Push to FP's queue
        fps_[fp_idx]->queue().push(pkt);
    }
}
```

**Step 3: Fast Path Thread**
```cpp
void FastPath::run() {
    while (running_) {
        // Pop from my input queue
        auto pkt = input_queue_.pop();

        // Look up flow (each FP has its own flow table)
        Flow& flow = flows_[pkt.tuple];

        // Classify (SNI extraction)
        classifyFlow(pkt, flow);

        // Check rules
        if (rules_->isBlocked(pkt.tuple.src_ip, flow.app_type, flow.sni)) {
            stats_->dropped++;
        } else {
            // Forward: push to output queue
            output_queue_->push(pkt);
        }
    }
}
```

**Step 4: Output Writer Thread**
```cpp
void outputThread() {
    while (running_ || output_queue_.size() > 0) {
        auto pkt = output_queue_.pop();

        // Write to output file
        output_file.write(packet_header);
        output_file.write(pkt.data);
    }
}
```

### Thread-Safe Queue

The magic that makes multi-threading work:

```cpp
template<typename T>
class TSQueue {
    std::queue<T> queue_;
    std::mutex mutex_;
    std::condition_variable not_empty_;
    std::condition_variable not_full_;

    void push(T item) {
        std::lock_guard<std::mutex> lock(mutex_);
        queue_.push(item);
        not_empty_.notify_one();  // Wake up waiting consumer
    }

    T pop() {
        std::unique_lock<std::mutex> lock(mutex_);
        not_empty_.wait(lock, [&]{ return !queue_.empty(); });
        T item = queue_.front();
        queue_.pop();
        return item;
    }
};
```

**How it works:**
- `push()`: Producer adds item, signals waiting consumers
- `pop()`: Consumer waits until item available, then takes it
- `mutex`: Only one thread can access at a time
- `condition_variable`: Efficient waiting (no busy-loop)

---

## 12. Deep Dive: Each Component

### pcap_reader.h / pcap_reader.cpp

**Purpose:** Read network captures saved by Wireshark

**Key structures:**
```cpp
struct PcapGlobalHeader {
    uint32_t magic_number;   // 0xa1b2c3d4 identifies PCAP
    uint16_t version_major;  // Usually 2
    uint16_t version_minor;  // Usually 4
    uint32_t snaplen;        // Max packet size captured
    uint32_t network;        // 1 = Ethernet
};

struct PcapPacketHeader {
    uint32_t ts_sec;         // Timestamp (seconds)
    uint32_t ts_usec;        // Timestamp (microseconds)
    uint32_t incl_len;       // Bytes saved in file
    uint32_t orig_len;       // Original packet size
};
```

**Key functions:**
- `open(filename)`: Open PCAP, validate header
- `readNextPacket(raw)`: Read next packet into buffer
- `close()`: Clean up

### packet_parser.h / packet_parser.cpp

**Purpose:** Extract protocol fields from raw bytes

**Key function:**
```cpp
bool PacketParser::parse(const RawPacket& raw, ParsedPacket& parsed) {
    parseEthernet(...);  // Extract MACs, EtherType
    parseIPv4(...);      // Extract IPs, protocol, TTL
    parseTCP(...);       // Extract ports, flags, seq numbers
    // OR
    parseUDP(...);       // Extract ports
}
```

**Important concepts:**

*Network Byte Order:* Network protocols use big-endian (most significant byte first). Your computer might use little-endian. We use `ntohs()` and `ntohl()` to convert:
```cpp
// ntohs = Network TO Host Short (16-bit)
uint16_t port = ntohs(*(uint16_t*)(data + offset));

// ntohl = Network TO Host Long (32-bit)
uint32_t seq = ntohl(*(uint32_t*)(data + offset));
```

### sni_extractor.h / sni_extractor.cpp

**Purpose:** Extract domain names from TLS and HTTP

**For TLS (HTTPS):**
```cpp
std::optional<std::string> SNIExtractor::extract(
    const uint8_t* payload,
    size_t length
) {
    // 1. Verify TLS record header
    // 2. Verify Client Hello handshake
    // 3. Skip to extensions
    // 4. Find SNI extension (type 0x0000)
    // 5. Extract hostname string
}
```

**For HTTP:**
```cpp
std::optional<std::string> HTTPHostExtractor::extract(
    const uint8_t* payload,
    size_t length
) {
    // 1. Verify HTTP request (GET, POST, etc.)
    // 2. Search for "Host: " header
    // 3. Extract value until newline
}
```

### types.h / types.cpp

**Purpose:** Define data structures used throughout

**FiveTuple:**
```cpp
struct FiveTuple {
    uint32_t src_ip;
    uint32_t dst_ip;
    uint16_t src_port;
    uint16_t dst_port;
    uint8_t  protocol;

    bool operator==(const FiveTuple& other) const;
};
```

**AppType:**
```cpp
enum class AppType {
    UNKNOWN,
    HTTP,
    HTTPS,
    DNS,
    GOOGLE,
    YOUTUBE,
    FACEBOOK,
    // ... more apps
};
```

**sniToAppType function:**
```cpp
AppType sniToAppType(const std::string& sni) {
    if (sni.find("youtube") != std::string::npos)
        return AppType::YOUTUBE;
    if (sni.find("facebook") != std::string::npos)
        return AppType::FACEBOOK;
    // ... more patterns
}
```

---

## 13. How SNI Extraction Works

### The TLS Handshake

When you visit `https://www.youtube.com`:

```
┌──────────┐                              ┌──────────┐
│  Browser │                              │  Server  │
└────┬─────┘                              └────┬─────┘
     │                                         │
     │ ──── Client Hello ─────────────────────►│
     │      (includes SNI: www.youtube.com)    │
     │                                         │
     │ ◄─── Server Hello ───────────────────── │
     │      (includes certificate)             │
     │                                         │
     │ ──── Key Exchange ─────────────────────►│
     │                                         │
     │ ◄═══ Encrypted Data ══════════════════► │
     │      (from here on, everything is       │
     │       encrypted - we can't see it)      │
```

**We can only extract SNI from the Client Hello!**

### TLS Client Hello Structure

```
Byte 0:     Content Type = 0x16 (Handshake)
Bytes 1-2:  Version = 0x0301 (TLS 1.0)
Bytes 3-4:  Record Length

-- Handshake Layer --
Byte 5:     Handshake Type = 0x01 (Client Hello)
Bytes 6-8:  Handshake Length

-- Client Hello Body --
Bytes 9-10:  Client Version
Bytes 11-42: Random (32 bytes)
Byte 43:     Session ID Length (N)
Bytes 44 to 44+N: Session ID
... Cipher Suites ...
... Compression Methods ...

-- Extensions --
Bytes X-X+1: Extensions Length
For each extension:
    Bytes: Extension Type (2)
    Bytes: Extension Length (2)
    Bytes: Extension Data

-- SNI Extension (Type 0x0000) --
Extension Type: 0x0000
Extension Length: L
  SNI List Length: M
  SNI Type: 0x00 (hostname)
  SNI Length: K
  SNI Value: "www.youtube.com" ← THE GOAL!
```

### Extraction Code (Simplified)

```cpp
std::optional<std::string> SNIExtractor::extract(
    const uint8_t* payload, size_t length
) {
    // Check TLS record header
    if (payload[0] != 0x16) return std::nullopt;  // Not handshake
    if (payload[5] != 0x01) return std::nullopt;  // Not Client Hello

    size_t offset = 43;  // Skip to session ID

    // Skip Session ID
    uint8_t session_len = payload[offset];
    offset += 1 + session_len;

    // Skip Cipher Suites
    uint16_t cipher_len = readUint16BE(payload + offset);
    offset += 2 + cipher_len;

    // Skip Compression Methods
    uint8_t comp_len = payload[offset];
    offset += 1 + comp_len;

    // Read Extensions Length
    uint16_t ext_len = readUint16BE(payload + offset);
    offset += 2;

    // Search for SNI extension
    size_t ext_end = offset + ext_len;
    while (offset + 4 <= ext_end) {
        uint16_t ext_type = readUint16BE(payload + offset);
        uint16_t ext_data_len = readUint16BE(payload + offset + 2);
        offset += 4;

        if (ext_type == 0x0000) {  // SNI!
            // Parse SNI structure
            uint16_t sni_len = readUint16BE(payload + offset + 3);
            return std::string(
                (char*)(payload + offset + 5),
                sni_len
            );
        }

        offset += ext_data_len;
    }

    return std::nullopt;  // SNI not found
}
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

---

## 14. API Reference

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

## 15. Project Structure

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

## 16. Architecture

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

## 17. Troubleshooting

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

## 18. Extending the Project

### Add New Protocols

1. Identify packet structure (search online or look at Wireshark's source)
2. Add detection logic in `sni_extractor.cpp` or `packet_parser.cpp`
3. Add new `AppType` to `types.h`
4. Map protocol name to `AppType` in `types.cpp`
5. Add UI support in `frontend/src/utils/protocols.js`

### Add New Applications

Just edit `sni_extractor.cpp` — add a new pattern:
```cpp
if (sni.find("newapp") != std::string::npos) {
    return AppType::NEWAPP;
}
```
And add the UI support in `frontend/src/utils/protocols.js`.

### Advanced Extensions

| Feature | Difficulty | Where to Start |
|---------|-----------|----------------|
| Protocol dissection | Medium | Extend PacketParser with new protocol parsers |
| HTTP/2 support | Hard | Parse HPACK header compression |
| QUIC support | Hard | Parse QUIC packets (UDP-based) |
| Statistics database | Easy | Add SQLite, create schema |
| Traffic shaping | Very Hard | Modify packet forwarding, add queuing |
| Deep content inspection | Very Hard | Decompress, parse, filter application data |

---

&copy; 2026 SCOUT — A deep packet inspection based website blocking system for Windows.
