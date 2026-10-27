'use strict';
// TIMER MODULE + event-loop ordering
const { setTimeout: sleep } = require('timers/promises');
console.log('1. script start');
setTimeout(() => console.log('5. setTimeout 0ms'), 0);
setImmediate(() => console.log('6. setImmediate'));
process.nextTick(() => console.log('3. process.nextTick'));
Promise.resolve().then(() => console.log('4. promise microtask'));

let n = 0;
const iv = setInterval(() => {
  console.log(`   interval tick ${++n}`);
  if (n === 3) { clearInterval(iv); console.log('   interval cleared'); }
}, 200);

const t = setTimeout(() => console.log('   never printed'), 5000);
clearTimeout(t);
(async () => { await sleep(900); console.log('7. awaited timers/promises sleep (900ms)'); })();
console.log('2. script end');
