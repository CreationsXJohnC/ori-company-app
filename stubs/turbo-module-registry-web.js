'use strict';
/**
 * Web stub for react-native's TurboModuleRegistry.
 *
 * Problem: react-native's TurboModuleRegistry.js imports NativeModules.js at
 * module-load time. NativeModules.js immediately calls
 *   invariant(__fbBatchedBridgeConfig, ...)
 * which crashes on web (the native bridge is never set up).
 *
 * Additionally, code that calls TurboModuleRegistry.getEnforcing('X') expects
 * a non-null object with methods like getConstants(), connect(), etc.
 * If we return null, callers crash with "Cannot read properties of null".
 *
 * This stub provides:
 *   - get(name)         → null  (caller must null-check, per RN contract)
 *   - getEnforcing(name) → a safe mock object (never null)
 *
 * The mock object's Proxy returns:
 *   - getConstants()   → {}   (so destructuring `{ Dimensions }` gives undefined,
 *                              not a crash)
 *   - any other prop   → noop function (() => undefined)
 */
const _noop = () => undefined;

const _mockModule = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === 'getConstants') return () => ({});
      if (prop === 'then') return undefined; // not a Promise
      return _noop;
    },
  }
);

const TurboModuleRegistry = {
  get: (_name) => null,
  getEnforcing: (_name) => _mockModule,
};

module.exports = TurboModuleRegistry;
module.exports.default = TurboModuleRegistry;
module.exports.__esModule = true;
