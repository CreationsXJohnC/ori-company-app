'use strict';
/**
 * Web replacement for react-native's setUpTimers.js
 *
 * The native setUpTimers.js overrides global.setTimeout / setInterval / etc.
 * with JSTimers versions backed by the native bridge. On web, those bridge
 * calls don't exist, which causes "setTimeout is not a function" crashes in
 * React and DevLoadingView.
 *
 * Strategy:
 *   - Leave browser-native timer APIs (setTimeout, clearTimeout, setInterval,
 *     clearInterval, requestAnimationFrame, cancelAnimationFrame) UNTOUCHED.
 *   - Polyfill only the non-standard APIs that react-native internals rely on
 *     but browsers don't provide natively: setImmediate / clearImmediate.
 *   - Ensure queueMicrotask is available (modern browsers already have it).
 */

if (typeof global.setImmediate !== 'function') {
  global.setImmediate = function setImmediate(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return setTimeout(function () { fn.apply(null, args); }, 0);
  };
}

if (typeof global.clearImmediate !== 'function') {
  global.clearImmediate = function clearImmediate(id) {
    clearTimeout(id);
  };
}

if (typeof global.queueMicrotask !== 'function') {
  global.queueMicrotask = function queueMicrotask(fn) {
    Promise.resolve().then(fn);
  };
}
