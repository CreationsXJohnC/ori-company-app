const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// SVG support
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// Web platform resolver — fixes RN 0.76 + react-native-web 0.19 incompatibility.
// RN 0.76 changed many internal files to use relative imports (e.g. require('../../Utilities/Platform'))
// instead of package-level imports. react-native-web's top-level alias can't intercept these.
// Strategy: for any relative import originating inside react-native/Libraries that has no
// .web.js stub, redirect it to a known react-native-web export or a generic safe no-op stub.
// Match ONLY files inside the react-native package itself (not react-native-web,
// react-native-reanimated, react-native-gesture-handler, etc. which also start
// with the string "react-native" but are separate packages).
// The trailing path.sep ('/' on macOS/Linux) ensures e.g.
//   node_modules/react-native/Libraries/foo.js  → matched ✓
//   node_modules/react-native-web/dist/bar.js   → NOT matched ✓
const RN_LIBS = path.resolve(__dirname, 'node_modules/react-native') + path.sep;
const RNW_EXPORTS = path.resolve(__dirname, 'node_modules/react-native-web/dist/exports');
const WEB_STUB = path.resolve(__dirname, 'stubs/rn-web-stub.js');
const TURBO_STUB = path.resolve(__dirname, 'stubs/turbo-module-registry-web.js');
const TIMERS_STUB = path.resolve(__dirname, 'stubs/set-up-timers-web.js');

// Named redirects to real react-native-web implementations (or safe stubs).
// Keys are the basename of the module path being imported from within react-native.
const WEB_OVERRIDES = {
  // --- Real react-native-web implementations ---
  Platform:               path.join(RNW_EXPORTS, 'Platform/index.js'),
  StyleSheet:             path.join(RNW_EXPORTS, 'StyleSheet/index.js'),
  processColor:           path.join(RNW_EXPORTS, 'processColor/index.js'),
  // Redirect Dimensions to react-native-web's version so it never touches
  // NativeDeviceInfo (which would call TurboModuleRegistry.getEnforcing at
  // module-load time, crashing before React even mounts).
  Dimensions:             path.join(RNW_EXPORTS, 'Dimensions/index.js'),

  // --- Safe stubs for native-only modules ---
  // checkNativeVersion calls Platform.constants.reactNativeVersion at module-load
  // time, but react-native-web's Platform has no `constants` → TypeError crash.
  checkNativeVersion:     WEB_STUB,
  // Smart TurboModuleRegistry stub: get() returns null, getEnforcing() returns
  // a safe mock with getConstants→{} and all other methods as noops.
  // This prevents "Cannot read properties of null (reading 'getConstants')" etc.
  TurboModuleRegistry:    TURBO_STUB,
  // Prevent NativeModules from being evaluated — it calls invariant(__fbBatchedBridgeConfig)
  // immediately on web, crashing the entire bootstrap before React mounts.
  NativeModules:          WEB_STUB,

  // --- InitializeCore polyfill overrides: keep browser globals intact ---
  // setUpTimers.js overrides global.setTimeout/clearTimeout/setInterval etc.
  // with react-native JSTimers (bridge-backed). On web this makes setTimeout
  // return undefined (non-function) → "setTimeout is not a function" crash.
  // Stub it so the browser's native timer functions remain unchanged.
  setUpTimers:            TIMERS_STUB,
  // setUpBatchedBridge.js initialises react-native's native message queue.
  // On web there is no native bridge, so let this be a no-op.
  setUpBatchedBridge:     WEB_STUB,
  // setUpXHR.js overrides fetch, XMLHttpRequest, FormData, Blob, WebSocket, URL
  // etc. with react-native bridge-backed versions. On web we want the browser's
  // native (or react-native-web's) implementations.
  setUpXHR:               WEB_STUB,
  // setUpDeveloperTools.js loads DevLoadingView + HMRClient for native hot-
  // reload. On web, Expo handles HMR via @expo/metro-runtime. The native dev
  // tools crash with setImmediate/getConstants errors; stub them out entirely.
  setUpDeveloperTools:    WEB_STUB,
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web') {
      const fromInsideRN = context.originModulePath.startsWith(RN_LIBS);
      if (fromInsideRN && (moduleName.startsWith('./') || moduleName.startsWith('../'))) {
        // Check for a named react-native-web override matching the module basename
        const baseName = path.basename(moduleName);
        if (WEB_OVERRIDES[baseName]) {
          return { filePath: WEB_OVERRIDES[baseName], type: 'sourceFile' };
        }
        // Try normal resolution first (succeeds if a .web.js file exists)
        try {
          const result = defaultResolveRequest
            ? defaultResolveRequest(context, moduleName, platform)
            : context.resolveRequest(context, moduleName, platform);
          if (result) return result;
        } catch {
          // No .web.js found — fall through to generic no-op stub
        }
        return { filePath: WEB_STUB, type: 'sourceFile' };
      }
    }
    if (defaultResolveRequest) {
      return defaultResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
