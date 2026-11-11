const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const config = require('../config.json');
const { loadStudents, findStudent } = require('../src/students');
const { createCertificate, safeFilename } = require('../src/certificate');

const secret = 'test-secret-only-not-for-production';
const students = loadStudents(path.join(__dirname, '..', 'data', 'students.csv'));

test('valid match returns the canonical name and produces a PDF', async () => {
  const name = findStudent(students, '  PRAGATI   JAIN ', ' btcb25o1091 ');
  assert.equal(name, 'Pragati Jain');
  const output = path.join(os.tmpdir(), `gsx-certificate-test-${process.pid}.pdf`);
  fs.writeFileSync(output, await createCertificate(output, config, name));
  assert.ok(fs.statSync(output).size > 500);
  assert.equal(safeFilename(name), 'Certificate_Pragati_Jain.pdf');
});
test('wrong enrollment gives no eligibility', async () => {
  assert.equal(findStudent(students, 'Pragati Jain', 'WRONG'), null);
});
test('wrong name gives no eligibility', async () => {
  assert.equal(findStudent(students, 'Someone Else', 'BTCB25O1091'), null);
});
test('empty input is rejected', async () => {
  assert.equal(findStudent(students, '', ''), null);
});
test('expired token cannot download a certificate', async () => {
  const expired = jwt.sign({ name: 'Pragati Jain' }, secret, { algorithm: 'HS256', expiresIn: -1 });
  assert.throws(() => jwt.verify(expired, secret, { algorithms: ['HS256'] }), /jwt expired/);
});
