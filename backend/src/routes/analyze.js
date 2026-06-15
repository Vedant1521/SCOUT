import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { runDpiAnalysis } from '../services/dpiRunner.js';
import { saveReport, getReports, getReportById } from '../services/reportService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '..', '..', process.env.UPLOAD_DIR || './uploads');

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.pcap')) {
      return cb(new Error('Only .pcap files are allowed'));
    }
    cb(null, true);
  },
});

const router = Router();

router.post('/upload', upload.single('pcap'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No pcap file uploaded' });
    }

    const rules = {
      blockedIps: req.body.blockedIps ? JSON.parse(req.body.blockedIps) : [],
      blockedApps: req.body.blockedApps ? JSON.parse(req.body.blockedApps) : [],
      blockedDomains: req.body.blockedDomains ? JSON.parse(req.body.blockedDomains) : [],
      blockedPorts: req.body.blockedPorts ? JSON.parse(req.body.blockedPorts) : [],
    };

    const analysisResult = await runDpiAnalysis(req.file.path, rules);
    const report = await saveReport(analysisResult, req.body.userId || 'anonymous');

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const reports = await getReports(req.query.userId || 'anonymous');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reports/:id', async (req, res) => {
  try {
    const report = await getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
