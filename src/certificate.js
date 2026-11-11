const fs = require('node:fs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { createTemplate } = require('./template');

function hexColor(hex) {
  const value = hex.replace('#', '');
  return rgb(parseInt(value.slice(0, 2), 16) / 255, parseInt(value.slice(2, 4), 16) / 255, parseInt(value.slice(4, 6), 16) / 255);
}

async function createCertificate(templatePath, config, name) {
  if (!fs.existsSync(templatePath)) await createTemplate(templatePath);
  const pdf = await PDFDocument.load(fs.readFileSync(templatePath));
  const page = pdf.getPage(0);
  const font = await pdf.embedFont(StandardFonts[config.name.font] || StandardFonts.HelveticaBold);
  let size = config.name.size;
  const maxWidth = page.getWidth() - 160;
  while (size > 16 && font.widthOfTextAtSize(name, size) > maxWidth) size -= 1;
  const width = font.widthOfTextAtSize(name, size);
  page.drawText(name, {
    x: (page.getWidth() - width) / 2,
    y: config.name.y,
    size,
    font,
    color: hexColor(config.name.color)
  });
  return pdf.save();
}

function safeFilename(name) {
  const cleaned = name.normalize('NFKD').replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '_').slice(0, 80);
  return `Certificate_${cleaned || 'Student'}.pdf`;
}

module.exports = { createCertificate, safeFilename };
