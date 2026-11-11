const path = require('node:path');
const { createTemplate } = require('../src/template');

createTemplate(path.join(__dirname, '..', 'assets', 'certificate_template.pdf'))
  .then(() => console.log('Created assets/certificate_template.pdf'))
  .catch((error) => { console.error('Could not create template:', error.message); process.exitCode = 1; });
