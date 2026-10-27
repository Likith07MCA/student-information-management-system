'use strict';
// ASSERTION: uses the built-in assert module to validate input.
const assert = require('assert');
const { AppError } = require('./errors');

function check(cond, msg) {
  try { assert.ok(cond, msg); }
  catch (e) { throw new AppError(msg, 400, 'E_VALIDATION'); } // AssertionError -> AppError
}

/** Validate student data. When partial=true only supplied fields are checked (for updates). */
function validateStudent(d, partial = false) {
  check(d && typeof d === 'object', 'Student data is required');
  const need = (f) => !partial || d[f] !== undefined;
  if (need('rollNo'))     check(typeof d.rollNo === 'string' && d.rollNo.trim().length >= 2, 'rollNo must be at least 2 characters');
  if (need('name'))       check(typeof d.name === 'string' && d.name.trim().length >= 2, 'name must be at least 2 characters');
  if (need('email'))      check(typeof d.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email), 'email is not valid');
  if (need('department')) check(typeof d.department === 'string' && d.department.trim() !== '', 'department is required');
  if (need('year')) {
    const y = Number(d.year);
    check(Number.isInteger(y) && y >= 1 && y <= 6, 'year must be an integer between 1 and 6');
  }
  return d;
}
module.exports = { validateStudent };
