import Report from '../models/Report.js';

export async function saveReport(analysisResult, userId = 'anonymous') {
  const doc = {
    userId,
    inputFile: analysisResult.input_file,
    analyzedAt: new Date(),
    engineVersion: analysisResult.engine_version,
    durationMs: analysisResult.summary?.duration_ms,
    summary: {
      totalPackets: analysisResult.summary?.total_packets,
      forwarded: analysisResult.summary?.forwarded,
      dropped: analysisResult.summary?.dropped,
      totalBytes: analysisResult.summary?.total_bytes,
    },
    protocolBreakdown: analysisResult.protocol_breakdown,
    applicationBreakdown: analysisResult.application_breakdown,
    detectedDomains: analysisResult.detected_domains,
    blockedConnections: analysisResult.blocked_connections?.map(c => ({
      srcIp: c.src_ip,
      dstIp: c.dst_ip,
      app: c.app,
      domain: c.domain,
    })) || [],
    rulesApplied: {
      blockedIps: analysisResult.rules_applied?.blocked_ips,
      blockedApps: analysisResult.rules_applied?.blocked_apps,
      blockedDomains: analysisResult.rules_applied?.blocked_domains,
      blockedPorts: analysisResult.rules_applied?.blocked_ports,
    },
    threadStats: analysisResult.thread_stats,
  };

  return await Report.create(doc);
}

export async function getReports(userId = 'anonymous', limit = 20) {
  return await Report.find({ userId })
    .sort({ analyzedAt: -1 })
    .limit(limit)
    .lean();
}

export async function getReportById(id) {
  return await Report.findById(id).lean();
}
