import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { findOrCreateUser } from '../models/User.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Credential required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user = findOrCreateUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, picture: user.picture },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, picture: user.picture } });
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ error: 'Invalid Google credential' });
  }
});

router.post('/demo', (req, res) => {
  const user = findOrCreateUser({
    googleId: 'demo_user',
    email: 'demo@dpiblocker.local',
    name: 'Demo User',
    picture: null,
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name, picture: user.picture },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, picture: user.picture } });
});

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default router;
