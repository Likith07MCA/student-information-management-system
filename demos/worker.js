'use strict';
// Child script started by child-demo.js using fork() (IPC channel)
process.on('message', (m) => {
  const total = m.numbers.reduce((a, b) => a + b, 0);
  process.send({ pid: process.pid, total, average: total / m.numbers.length });
  process.exit(0);
});
