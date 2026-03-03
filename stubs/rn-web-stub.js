/**
 * Generic web stub for react-native internal modules that only have
 * .ios.js / .android.js platform files (no .web.js counterpart).
 *
 * Uses a Proxy so any property access returns a safe no-op.
 * This prevents "cannot read property of undefined" crashes during web bundling
 * while react-native-web's top-level aliases handle the actual implementations.
 */
const noop = () => null;
const stub = new Proxy(
  { processColorObject: noop, PlatformColor: noop, default: {} },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === '__esModule') return true;
      if (prop === 'default') return stub;
      return noop;
    },
  }
);

module.exports = stub;
