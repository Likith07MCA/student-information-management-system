'use strict';
// REPL: interactive shell with the student store preloaded.
//   > await store.list()      > .count      > .add Name,Roll,email,dept,year
const repl = require('repl');
const { store } = require('./lib/studentStore');

console.log('Student REPL. Try: await store.list()   |   .count   |   .add Asha,CS101,a@x.com,CSE,2   |   .exit');
const r = repl.start({ prompt: 'sms> ', useGlobal: true });
r.context.store = store;

r.defineCommand('count', {
  help: 'Show number of students',
  async action() { console.log((await store.list()).length); this.displayPrompt(); },
});
r.defineCommand('add', {
  help: 'Add student: .add name,roll,email,dept,year',
  async action(arg) {
    const [name, rollNo, email, department, year] = arg.split(',').map((x) => x.trim());
    try { console.log(await store.add({ name, rollNo, email, department, year })); }
    catch (e) { console.error('Error:', e.message); }
    this.displayPrompt();
  },
});
r.on('exit', () => { console.log('Bye'); process.exit(0); });
