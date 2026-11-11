const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('node:path');
const { findStudent } = require('./students');
const { createCertificate, safeFilename } = require('./certificate');

const MAX_NAME = 100;
const MAX_ENROLLMENT = 30;

function createApp({ students, config, secret, templatePath, logger = console }) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '2kb' }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.post('/api/verify', (req, res) => {
    const { name, enrollment_no: enrollmentNo } = req.body || {};
    if (typeof name !== 'string' || typeof enrollmentNo !== 'string' || !name.trim() || !enrollmentNo.trim() || name.trim().length > MAX_NAME || enrollmentNo.trim().length > MAX_ENROLLMENT) {
      return res.status(400).json({ eligible: false, error: 'Please enter a valid name and enrollment number.' });
    }
    const studentName = findStudent(students, name, enrollmentNo);
    logger.info?.(`${new Date().toISOString()} verify ${studentName ? 'found' : 'not-found'}`);
    if (!studentName) return res.json({ eligible: false });
    const token = jwt.sign({ name: studentName }, secret, { algorithm: 'HS256', expiresIn: '10m' });
    return res.json({ eligible: true, token });
  });

  app.get('/api/certificate', async (req, res) => {
    try {
      const payload = jwt.verify(req.query.token, secret, { algorithms: ['HS256'] });
      if (!payload || typeof payload.name !== 'string') throw new Error('Invalid token');
      const pdf = await createCertificate(templatePath, config, payload.name);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename(payload.name)}"`,
        'Cache-Control': 'no-store'
      });
      return res.send(Buffer.from(pdf));
    } catch (_) {
      return res.status(401).json({ error: 'This download link is invalid or has expired. Please verify your details again.' });
    }
  });

  app.use((err, _req, res, _next) => {
    logger.error?.(`${new Date().toISOString()} unexpected-error`);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  });
  return app;
}

module.exports = { createApp };
