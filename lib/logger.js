'use strict';
// EVENTS + STREAMS + CONSOLE: logger is an EventEmitter that writes to console and a file stream.
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class Logger extends EventEmitter {
  constructor() {
    super();
    fs.mkdirSync(path.join(__dirname, '..', 'logs'), { recursive: true });
    this.stream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'app.log'), { flags: 'a' });
    this.on('log', (level, msg) => {
      const line = `${new Date().toISOString()} [${level.toUpperCase()}] ${msg}`;
      this.stream.write(line + '\n');
      (level === 'error' ? console.error : console.log)(line);
    });
  }
  info(m)  { this.emit('log', 'info', m); }
  warn(m)  { this.emit('log', 'warn', m); }
  error(m) { this.emit('log', 'error', m); }
  close()  { return new Promise((r) => this.stream.end(r)); }
}
module.exports = new Logger();
