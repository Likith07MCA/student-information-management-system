'use strict';
// EVENTS + CALLBACKS
const EventEmitter = require('events');
const { store, StudentStore } = require('../lib/studentStore');
const path = require('path'), os = require('os'), fs = require('fs');

class Registrar extends EventEmitter {}
const reg = new Registrar();
reg.on('enrolled', (n) => console.log('listener 1: welcome', n));
reg.once('enrolled', (n) => console.log('listener 2 (once):', n));
reg.on('error', (e) => console.log('error event handled:', e.message));
reg.emit('enrolled', 'Asha'); reg.emit('enrolled', 'Ravi');
reg.emit('error', new Error('Something went wrong'));
console.log('listener count:', reg.listenerCount('enrolled'));

// Callback hell vs. promise: the store offers both
const demoStore = new StudentStore(path.join(os.tmpdir(), 'demo-students.json'));
demoStore.on('added', (s) => console.log('store event "added":', s.name));
demoStore.add({ rollNo: 'EV01', name: 'Event Student', email: 'e@x.com', department: 'CSE', year: 1 })
  .then(() => {
    demoStore.getAllCb((err, list) => {                          // error-first callback
      if (err) return console.error(err);
      console.log('callback got', list.length, 'student(s)');
      fs.unlinkSync(demoStore.file);
    });
  });
