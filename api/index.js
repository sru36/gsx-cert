// Vercel serverless entry point. Vercel supplies PORT/HTTPS; no app.listen here.
const path = require('node:path');
const config = require('../config.json');
const { loadStudents } = require('../src/students');
const { createApp } = require('../src/app');

const secret = process.env.TOKEN_SECRET;
if (!secret) throw new Error('TOKEN_SECRET must be set in Vercel project settings.');

module.exports = createApp({
  students: loadStudents(path.join(__dirname, '..', 'data', 'students.csv')),
  config,
  secret,
  templatePath: path.join(__dirname, '..', config.templatePath)
});
