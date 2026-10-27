'use strict';
// DNS + CRYPTO
const dns = require('dns');
const crypto = require('crypto');

(async () => {
  console.log('--- DNS ---');
  try {
    console.log('lookup localhost:', await dns.promises.lookup('localhost'));
    console.log('resolve4 example.com:', await dns.promises.resolve4('example.com'));
  } catch (e) { console.log('DNS error (offline?):', e.code); }   // error handling for no network

  console.log('\n--- CRYPTO ---');
  console.log('sha256  :', crypto.createHash('sha256').update('student-data').digest('hex'));
  console.log('hmac    :', crypto.createHmac('sha256', 'secret').update('student-data').digest('hex'));

  // Password hashing with salt (what you'd use for student/admin passwords)
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync('myPassword', salt, 100000, 32, 'sha256');
  console.log('pbkdf2  :', hash.toString('hex'));
  console.log('verify  :', crypto.timingSafeEqual(hash, crypto.pbkdf2Sync('myPassword', salt, 100000, 32, 'sha256')));

  // AES-256-GCM encrypt / decrypt a student record
  const key = crypto.randomBytes(32), iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([c.update(JSON.stringify({ name: 'Asha', gpa: 9.1 }), 'utf8'), c.final()]);
  const tag = c.getAuthTag();
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv); d.setAuthTag(tag);
  console.log('cipher  :', enc.toString('base64'));
  console.log('decrypt :', Buffer.concat([d.update(enc), d.final()]).toString());
  console.log('uuid    :', crypto.randomUUID());
})();
