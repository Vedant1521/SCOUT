// DPI Live Blocking Daemon (single-threaded, GCC 6.3 compatible)
// Replay mode only (no WinDivert)
// Protocol: stdin/stdout JSON-line, non-blocking stdin via PeekNamedPipe

#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>
#include <algorithm>
#include <sstream>
#include <cstdint>
#include <cstdlib>
#include <cctype>
#include <ctime>
#include <iomanip>

#include <windows.h>
#include <conio.h>

#include "sni_extractor.h"
#include "types.h"
#include "pcap_reader.h"
#include "packet_parser.h"
using namespace PacketAnalyzer;

using namespace DPI;

static std::string escapeJSON(const std::string& s) {
    std::string r; r.reserve(s.size());
    for (char c : s) {
        switch (c) {
            case '"': r += "\\\""; break;
            case '\\': r += "\\\\"; break;
            case '\n': r += "\\n"; break;
            case '\r': r += "\\r"; break;
            case '\t': r += "\\t"; break;
            default: r += c;
        }
    }
    return r;
}

static std::string toLower(std::string s) {
    std::transform(s.begin(), s.end(), s.begin(), ::tolower);
    return s;
}

static AppType appTypeFromString(const std::string& s) {
    std::string l = toLower(s);
    if (l == "google") return AppType::GOOGLE;
    if (l == "youtube") return AppType::YOUTUBE;
    if (l == "facebook") return AppType::FACEBOOK;
    if (l == "twitter") return AppType::TWITTER;
    if (l == "instagram") return AppType::INSTAGRAM;
    if (l == "netflix") return AppType::NETFLIX;
    if (l == "amazon") return AppType::AMAZON;
    if (l == "microsoft") return AppType::MICROSOFT;
    if (l == "apple") return AppType::APPLE;
    if (l == "whatsapp") return AppType::WHATSAPP;
    if (l == "telegram") return AppType::TELEGRAM;
    if (l == "tiktok") return AppType::TIKTOK;
    if (l == "spotify") return AppType::SPOTIFY;
    if (l == "zoom") return AppType::ZOOM;
    if (l == "discord") return AppType::DISCORD;
    if (l == "github") return AppType::GITHUB;
    if (l == "cloudflare") return AppType::CLOUDFLARE;
    return AppType::UNKNOWN;
}

static uint32_t ipStrToInt(const std::string& s) {
    uint32_t r = 0, o = 0, shift = 0;
    for (char c : s) {
        if (c == '.') { r |= (o << shift); shift += 8; o = 0; }
        else if (c >= '0' && c <= '9') o = o * 10 + (c - '0');
    }
    return r | (o << shift);
}

static void sendLine(const std::string& msg) {
    std::cout << msg << std::endl;
    std::cout.flush();
}

static bool tryReadStdin(std::string& line, bool& eof) {
    HANDLE hStdin = GetStdHandle(STD_INPUT_HANDLE);
    if (hStdin == INVALID_HANDLE_VALUE || hStdin == NULL) return false;
    DWORD fileType = GetFileType(hStdin);

    // Pipe: non-blocking check via PeekNamedPipe
    if (fileType == FILE_TYPE_PIPE) {
        DWORD bytesAvail = 0;
        if (!PeekNamedPipe(hStdin, NULL, 0, NULL, &bytesAvail, NULL)) return false;
        if (bytesAvail == 0) return false;
        if (!std::getline(std::cin, line)) { eof = true; return false; }
        return true;
    }

    // Console: non-blocking check via _kbhit
    if (fileType == FILE_TYPE_CHAR) {
        if (!_kbhit()) return false;
        if (!std::getline(std::cin, line)) { eof = true; return false; }
        return true;
    }

    // File (redirect): blocking read - all commands consumed at once
    if (!std::getline(std::cin, line)) { eof = true; return false; }
    return true;
}

static std::string findStr(const std::string& json, const std::string& key) {
    auto p = json.find("\"" + key + "\"");
    if (p == std::string::npos) return "";
    p = json.find('"', p + key.size() + 3);
    if (p == std::string::npos) return "";
    auto e = json.find('"', p + 1);
    return (e == std::string::npos) ? "" : json.substr(p + 1, e - p - 1);
}

static std::vector<std::string> findArr(const std::string& json, const std::string& key) {
    std::vector<std::string> r;
    auto p = json.find("\"" + key + "\"");
    if (p == std::string::npos) return r;
    p = json.find('[', p);
    if (p == std::string::npos) return r;
    auto e = json.find(']', p);
    if (e == std::string::npos) return r;
    std::string arr = json.substr(p + 1, e - p - 1);
    size_t s = 0;
    while (true) {
        auto q1 = arr.find('"', s); if (q1 == std::string::npos) break;
        auto q2 = arr.find('"', q1 + 1); if (q2 == std::string::npos) break;
        r.push_back(arr.substr(q1 + 1, q2 - q1 - 1));
        s = q2 + 1;
    }
    return r;
}

static std::vector<uint16_t> findPorts(const std::string& json, const std::string& key) {
    std::vector<uint16_t> r;
    auto p = json.find("\"" + key + "\"");
    if (p == std::string::npos) return r;
    p = json.find('[', p);
    if (p == std::string::npos) return r;
    auto e = json.find(']', p);
    if (e == std::string::npos) return r;
    std::string arr = json.substr(p + 1, e - p - 1);
    size_t s = 0;
    while (s < arr.size()) {
        while (s < arr.size() && (arr[s] == ' ' || arr[s] == ',')) s++;
        if (s >= arr.size()) break;
        char* ep; long v = std::strtol(arr.c_str() + s, &ep, 10);
        if (ep != arr.c_str() + s) { r.push_back((uint16_t)v); s = ep - arr.c_str(); }
        else break;
    }
    return r;
}

static std::string buildStats(uint64_t total, uint64_t fwd, uint64_t drop,
                              size_t nIps, size_t nApps, size_t nDoms, size_t nPorts) {
    std::ostringstream j;
    j << "{\"type\":\"stats\",\"totalPackets\":" << total
      << ",\"forwarded\":" << fwd
      << ",\"dropped\":" << drop
      << ",\"activeRules\":{\"ips\":" << nIps
      << ",\"apps\":" << nApps
      << ",\"domains\":" << nDoms
      << ",\"ports\":" << nPorts << "}}";
    return j.str();
}

// =============================================================================
// Main - single-threaded replay daemon
// =============================================================================
int main(int argc, char* argv[]) {
    std::string replayFile;
    bool replayMode = false;

    for (int i = 1; i < argc; i++) {
        std::string a = argv[i];
        if (a == "--replay" && i + 1 < argc) { replayFile = argv[++i]; replayMode = true; }
        else if (a == "--help") {
            std::cerr << "DPI Live Daemon (single-threaded, replay only)\n"
                      << "  --replay <pcap>   Replay PCAP file\n"
                      << "Stdin JSON commands:\n"
                      << "  {\"cmd\":\"rules\",...}  {\"cmd\":\"start\"}\n"
                      << "  {\"cmd\":\"stop\"}  {\"cmd\":\"stats\"}  {\"cmd\":\"shutdown\"}\n";
            return 0;
        }
    }

    if (!replayMode) {
        std::cerr << "Built without WinDivert. Use --replay <pcap>\n";
        return 1;
    }

    // Rule state
    std::unordered_set<uint32_t> blocked_ips;
    std::unordered_set<AppType> blocked_apps;
    std::vector<std::string> blocked_domains;
    std::unordered_set<uint16_t> blocked_ports;

    uint64_t totalPackets = 0, forwarded = 0, dropped = 0;
    bool capturing = false;
    bool running = true;
    bool pcapExhausted = false;

    PcapReader reader;
    bool pcapOpened = false;

    sendLine("{\"type\":\"ready\",\"version\":\"2.1\",\"mode\":\"replay\"}");

    bool stdinEof = false;
    while (running) {
        // --- Check stdin for commands (non-blocking) ---
        std::string line;
        if (!stdinEof && tryReadStdin(line, stdinEof) && !line.empty()) {
            std::string cmd = findStr(line, "cmd");
            if (cmd == "rules") {
                auto ips = findArr(line, "blockedIps");
                auto apps = findArr(line, "blockedApps");
                auto doms = findArr(line, "blockedDomains");
                auto ports = findPorts(line, "blockedPorts");
                blocked_ips.clear();
                for (const auto& ip : ips) blocked_ips.insert(ipStrToInt(ip));
                blocked_apps.clear();
                for (const auto& a : apps) {
                    AppType t = appTypeFromString(a);
                    if (t != AppType::UNKNOWN) blocked_apps.insert(t);
                }
                blocked_domains = doms;
                blocked_ports = std::unordered_set<uint16_t>(ports.begin(), ports.end());
            } else if (cmd == "start") {
                capturing = true;
                sendLine("{\"type\":\"capturing\",\"status\":\"started\"}");
                if (!pcapOpened) {
                    if (!reader.open(replayFile)) {
                        sendLine("{\"type\":\"error\",\"message\":\"Cannot open: " + replayFile + "\"}");
                        running = false;
                        break;
                    }
                    pcapOpened = true;
                }
            } else if (cmd == "stop") {
                capturing = false;
                sendLine("{\"type\":\"capturing\",\"status\":\"stopped\"}");
            } else if (cmd == "stats") {
                sendLine(buildStats(totalPackets, forwarded, dropped,
                    blocked_ips.size(), blocked_apps.size(),
                    blocked_domains.size(), blocked_ports.size()));
            } else if (cmd == "shutdown") {
                capturing = false;
                running = false;
                break;
            }
        }

        // --- Process one packet if capturing ---
        if (capturing && !pcapExhausted) {
            RawPacket raw;
            if (reader.readNextPacket(raw)) {
                totalPackets++;
                ParsedPacket parsed;
                if (PacketParser::parse(raw, parsed) && parsed.has_ip) {
                    std::string sni;
                    AppType app = AppType::UNKNOWN;

                    if (parsed.has_tcp && parsed.payload_data && parsed.payload_length > 5) {
                        if (parsed.dest_port == 443) {
                            auto r = SNIExtractor::extract(parsed.payload_data, parsed.payload_length);
                            if (r) { sni = *r; app = sniToAppType(sni); }
                        } else if (parsed.dest_port == 80) {
                            auto r = HTTPHostExtractor::extract(parsed.payload_data, parsed.payload_length);
                            if (r) { sni = *r; app = sniToAppType(sni); }
                        }
                    } else if (parsed.dest_port == 53 || parsed.src_port == 53) {
                        app = AppType::DNS;
                    }

                    uint32_t srcIpInt = ipStrToInt(parsed.src_ip);
                    bool blocked = false;
                    if (blocked_ips.count(srcIpInt)) blocked = true;
                    else if (blocked_ports.count(parsed.dest_port)) blocked = true;
                    else if (blocked_apps.count(app)) blocked = true;
                    else {
                        for (const auto& dom : blocked_domains) {
                            if (sni.find(dom) != std::string::npos) { blocked = true; break; }
                        }
                    }

                    if (blocked) {
                        dropped++;
                        std::ostringstream j;
                        j << "{\"type\":\"blocked\",\"srcIp\":\"" << parsed.src_ip
                          << "\",\"dstIp\":\"" << parsed.dest_ip
                          << "\",\"dstPort\":" << parsed.dest_port
                          << ",\"app\":\"" << appTypeToString(app)
                          << "\",\"sni\":\"" << escapeJSON(sni) << "\"}";
                        sendLine(j.str());
                    } else {
                        forwarded++;
                    }
                }
                Sleep(5);
            } else {
                pcapExhausted = true;
                capturing = false;
                sendLine("{\"type\":\"pcap_done\"}");
                sendLine(buildStats(totalPackets, forwarded, dropped,
                    blocked_ips.size(), blocked_apps.size(),
                    blocked_domains.size(), blocked_ports.size()));
            }
        }

        if (stdinEof && !capturing && pcapExhausted) {
            running = false;
            break;
        }

        if (!capturing) {
            Sleep(50);
        }
    }

    if (pcapOpened) reader.close();
    sendLine("{\"type\":\"stopped\"}");
    return 0;
}
