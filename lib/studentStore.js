'use strict';
// FILE SYSTEM + ASYNC + EVENTS + CALLBACKS + BUFFERS + ERROR HANDLING
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');
const { AppError } = require('./errors');
const { validateStudent } = require('./validators');

class StudentStore extends EventEmitter {
  constructor(file = path.join(__dirname, '..', 'data', 'students.json')) {
    super();
    this.file = file;
    this._queue = Promise.resolve(); // serialises writes so concurrent requests can't corrupt the file
  }

  // ---- low level I/O (async/await with fs.promises) ----
  async _read() {
    try {
      const buf = await fsp.readFile(this.file);          // Buffer
      return JSON.parse(buf.toString('utf8') || '[]');
    } catch (err) {
      if (err.code === 'ENOENT') return [];               // first run: no file yet
      if (err instanceof SyntaxError) throw new AppError('Data file is corrupted', 500, 'E_CORRUPT');
      throw err;
    }
  }
  async _write(list) {
    await fsp.mkdir(path.dirname(this.file), { recursive: true });
    const tmp = this.file + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(list, null, 2), 'utf8');
    await fsp.rename(tmp, this.file);                     // atomic replace
  }
  _locked(fn) {
    const run = this._queue.then(fn);
    this._queue = run.catch(() => {});
    return run;
  }

  // ---- CALLBACK style API (for demonstration) ----
  getAllCb(callback) {
    fs.readFile(this.file, 'utf8', (err, text) => {
      if (err && err.code === 'ENOENT') return callback(null, []);
      if (err) return callback(err);
      try { callback(null, JSON.parse(text || '[]')); } catch (e) { callback(e); }
    });
  }

  // ---- CRUD ----
  async list({ search, department } = {}) {
    let list = await this._read();
    if (department) list = list.filter((s) => s.department.toLowerCase() === String(department).toLowerCase());
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((s) => [s.rollNo, s.name, s.email, s.department].some((v) => v.toLowerCase().includes(q)));
    }
    return list;
  }

  async get(id) {
    const s = (await this._read()).find((x) => x.id === id);
    if (!s) throw new AppError(`Student ${id} not found`, 404, 'E_NOT_FOUND');
    return s;
  }

  add(data) {
    return this._locked(async () => {
      validateStudent(data);
      const list = await this._read();
      if (list.some((s) => s.rollNo.toLowerCase() === data.rollNo.trim().toLowerCase()))
        throw new AppError(`Roll number ${data.rollNo} already exists`, 409, 'E_DUPLICATE');
      const student = {
        id: crypto.randomBytes(4).toString('hex'),
        rollNo: data.rollNo.trim(), name: data.name.trim(), email: data.email.trim(),
        department: data.department.trim(), year: Number(data.year),
        createdAt: new Date().toISOString(),
      };
      list.push(student);
      await this._write(list);
      this.emit('added', student);
      return student;
    });
  }

  update(id, data) {
    return this._locked(async () => {
      validateStudent(data, true);
      const list = await this._read();
      const i = list.findIndex((s) => s.id === id);
      if (i === -1) throw new AppError(`Student ${id} not found`, 404, 'E_NOT_FOUND');
      const allowed = ['rollNo', 'name', 'email', 'department', 'year'];
      for (const k of allowed) if (data[k] !== undefined) list[i][k] = k === 'year' ? Number(data[k]) : String(data[k]).trim();
      list[i].updatedAt = new Date().toISOString();
      await this._write(list);
      this.emit('updated', list[i]);
      return list[i];
    });
  }

  remove(id) {
    return this._locked(async () => {
      const list = await this._read();
      const i = list.findIndex((s) => s.id === id);
      if (i === -1) throw new AppError(`Student ${id} not found`, 404, 'E_NOT_FOUND');
      const [removed] = list.splice(i, 1);
      await this._write(list);
      this.emit('deleted', removed);
      return removed;
    });
  }
}
module.exports = { StudentStore, store: new StudentStore() };
