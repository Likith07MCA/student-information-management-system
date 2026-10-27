'use strict';
// PROCESS object
console.log('PID        :', process.pid);
console.log('Node       :', process.version);
console.log('Platform   :', process.platform);
console.log('CWD        :', process.cwd());
console.log('argv       :', process.argv.slice(2));
console.log('PATH set?  :', Boolean(process.env.PATH));
console.log('Memory (MB):', Math.round(process.memoryUsage().rss / 1048576));
console.log('Uptime (s) :', process.uptime().toFixed(3));

process.stdout.write('Written with stdout.write (no newline) ');
process.stdout.write('\n');
process.on('exit', (code) => console.log('exit event, code =', code));
process.on('SIGINT', () => { console.log('Ctrl+C caught, exiting cleanly'); process.exit(0); });
setTimeout(() => { console.log('done'); process.exitCode = 0; }, 300);
