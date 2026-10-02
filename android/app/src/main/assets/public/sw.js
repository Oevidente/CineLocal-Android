/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "8a094c3e2c1720493a63c14b2c47ec57"
  }, {
    "url": "pwa-512x512.png",
    "revision": "80e3e3a771093089c1b119ca55ad5e9a"
  }, {
    "url": "pwa-192x192.png",
    "revision": "6fae22cf28d42d1666ca6922387273d0"
  }, {
    "url": "index.html",
    "revision": "da118de10e326ca5252e69a80f6a35c4"
  }, {
    "url": "icon.svg",
    "revision": "bff7d57ede0c21c4114e56b7c78327c6"
  }, {
    "url": "icon-maskable.svg",
    "revision": "c219dc58d421b7fd6fc62ec26ce04ce1"
  }, {
    "url": "favicon.png",
    "revision": "6fae22cf28d42d1666ca6922387273d0"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "d834511f6e6354102f3c8e8f14990296"
  }, {
    "url": "assets/index-CXYYygAt.js",
    "revision": null
  }, {
    "url": "assets/index-B82OXjVg.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "d834511f6e6354102f3c8e8f14990296"
  }, {
    "url": "favicon.png",
    "revision": "6fae22cf28d42d1666ca6922387273d0"
  }, {
    "url": "icon.svg",
    "revision": "bff7d57ede0c21c4114e56b7c78327c6"
  }, {
    "url": "pwa-192x192.png",
    "revision": "6fae22cf28d42d1666ca6922387273d0"
  }, {
    "url": "pwa-512x512.png",
    "revision": "80e3e3a771093089c1b119ca55ad5e9a"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "8a094c3e2c1720493a63c14b2c47ec57"
  }, {
    "url": "manifest.webmanifest",
    "revision": "153acc36c15c6c305b2b143631199639"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\//]
  }));

}));
