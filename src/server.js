require('dotenv').config();
const path = require('node:path');
const config = require('../config.json');
const { loadStudents } = require('./students');
const { createApp } = require('./app');

const secret = process.env.TOKEN_SECRET;
if (!secret || secret === 'replace-with-a-long-random-secret-before-deploying') {
  throw new Error('TOKEN_SECRET must be set to a long, unique value before starting the service.');
}
const students = loadStudents(path.join(__dirname, '..', 'data', 'students.csv'));
const app = createApp({
  students,
  config,
  secret,
  templatePath: path.join(__dirname, '..', config.templatePath)
});
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Certificate portal listening on port ${port}`));
