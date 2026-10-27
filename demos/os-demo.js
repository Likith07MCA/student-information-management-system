'use strict';
// OS MODULE
const os = require('os');
console.log('Platform     :', os.platform(), os.arch(), os.release());
console.log('Hostname     :', os.hostname());
console.log('CPUs         :', os.cpus().length, '-', os.cpus()[0].model);
console.log('Total memory :', (os.totalmem() / 1073741824).toFixed(2), 'GB');
console.log('Free memory  :', (os.freemem() / 1073741824).toFixed(2), 'GB');
console.log('Uptime       :', Math.round(os.uptime() / 60), 'minutes');
console.log('Home dir     :', os.homedir());
console.log('Temp dir     :', os.tmpdir());
console.log('EOL          :', JSON.stringify(os.EOL));
console.log('User         :', os.userInfo().username);
