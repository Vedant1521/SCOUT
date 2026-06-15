import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: { type: String, default: 'anonymous' },
  inputFile: String,
  analyzedAt: { type: Date, default: Date.now },
  engineVersion: String,
  durationMs: Number,

  summary: {
    totalPackets: Number,
    forwarded: Number,
    dropped: Number,
    totalBytes: Number,
  },

  protocolBreakdown: {
    tcp: Number,
    udp: Number,
    other: Number,
  },

  applicationBreakdown: [{
    app: String,
    packets: Number,
    percentage: Number,
  }],

  detectedDomains: [{
    domain: String,
    app: String,
  }],

  blockedConnections: [{
    srcIp: String,
    dstIp: String,
    app: String,
    domain: String,
  }],

  rulesApplied: {
    blockedIps: [String],
    blockedApps: [String],
    blockedDomains: [String],
    blockedPorts: [Number],
  },

  threadStats: {
    loadBalancers: [{ id: Number, dispatched: Number }],
    fastPaths: [{ id: Number, processed: Number }],
  },
});

export default mongoose.model('Report', reportSchema);
