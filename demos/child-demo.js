'use strict';
// CHILD PROCESS: exec, execFile, spawn, fork
const { exec, execFile, spawn, fork } = require('child_process');
const path = require('path');

exec('node -v', (err, stdout, stderr) => {                       // exec: buffers the whole output
  if (err) return console.error('exec error:', err.message);
  console.log('exec     -> node version', stdout.trim());
});
execFile('node', ['-e', 'console.log(6*7)'], (err, out) => {      // execFile: no shell
  console.log('execFile -> 6*7 =', out.trim());
});
const sp = spawn('node', ['-e', 'for(let i=1;i<=3;i++)console.log("line "+i)']);   // spawn: streams
sp.stdout.on('data', (d) => console.log('spawn    ->', d.toString().trim()));
sp.on('close', (code) => console.log('spawn    -> exited with', code));

const child = fork(path.join(__dirname, 'worker.js'));            // fork: Node child with IPC
child.on('message', (m) => console.log('fork     ->', m));
child.send({ numbers: [10, 20, 30, 40] });

exec('this-command-does-not-exist', (err) => console.log('error handling ->', err ? 'command failed (code ' + err.code + ')' : 'ok'));
