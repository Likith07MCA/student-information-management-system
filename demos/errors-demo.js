'use strict';
// ERROR HANDLING
const fs = require('fs');
const { AppError } = require('../lib/errors');

try { JSON.parse('{bad json'); } catch (e) { console.log('1. try/catch      :', e.name, '-', e.message); }

fs.readFile('/no/such/file', (err) => console.log('2. callback error :', err.code, '-', err.message));

fs.promises.readFile('/no/such/file').catch((e) => console.log('3. promise catch  :', e.code));

(async () => {
  try { await fs.promises.readFile('/no/such/file'); }
  catch (e) { console.log('4. async/await    :', e.syscall, e.errno); }
  finally { console.log('   finally block runs always'); }
})();

try { throw new AppError('Student not found', 404, 'E_NOT_FOUND'); }
catch (e) { console.log('5. custom error   :', e instanceof AppError, e.statusCode, e.code); }

process.on('unhandledRejection', (r) => console.log('6. unhandledRejection caught:', r.message));
Promise.reject(new Error('forgotten promise'));
