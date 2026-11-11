const fs = require('node:fs');
const path = require('node:path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const pageWidth = 1123;
const pageHeight = 794;

async function createTemplate(outputPath) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([pageWidth, pageHeight]);
  const black = rgb(0.07, 0.07, 0.07);
  const gold = rgb(0.71, 0.58, 0.3);
  const serif = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 24, y: 24, width: pageWidth - 48, height: pageHeight - 48, borderColor: black, borderWidth: 8 });
  page.drawRectangle({ x: 42, y: 42, width: pageWidth - 84, height: pageHeight - 84, borderColor: gold, borderWidth: 2 });
  const title = 'CERTIFICATE OF COMPLETION';
  page.drawText(title, { x: (pageWidth - serif.widthOfTextAtSize(title, 51)) / 2, y: 624, size: 51, font: serif, color: black });
  const intro = 'This certificate is proudly presented to';
  page.drawText(intro, { x: (pageWidth - sans.widthOfTextAtSize(intro, 20)) / 2, y: 554, size: 20, font: sans, color: rgb(.33, .33, .33) });
  page.drawLine({ start: { x: 280, y: 284 }, end: { x: 500, y: 284 }, thickness: 1, color: black });
  page.drawLine({ start: { x: 623, y: 284 }, end: { x: 843, y: 284 }, thickness: 1, color: black });
  page.drawText('GSX Gwalior Chapter', { x: 326, y: 257, size: 16, font: sans, color: rgb(.2, .2, .2) });
  page.drawText('Authorized Signature', { x: 655, y: 257, size: 16, font: sans, color: rgb(.2, .2, .2) });
  page.drawText('GSX Gwalior Chapter', { x: 475, y: 174, size: 18, font: sans, color: rgb(.27, .27, .27) });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, await pdf.save());
}

module.exports = { createTemplate, pageWidth, pageHeight };
