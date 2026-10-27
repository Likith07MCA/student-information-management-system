'use strict';
// DEBUGGER. Run:  npm run debug     (= node inspect demos/debug-demo.js)
// Commands: n (next)  s (step in)  o (step out)  c (continue)  repl  watch('total')  sb(12)  .exit
// Or use VS Code / chrome://inspect with:  node --inspect-brk demos/debug-demo.js
function average(marks) {
  let total = 0;
  for (const m of marks) {
    total += m;
  }
  debugger;                       // execution pauses here when run under the debugger
  return total / marks.length;
}
const marks = [78, 92, 85, 64];
console.log('Average mark:', average(marks));
