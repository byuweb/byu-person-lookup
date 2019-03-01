/*
 *  @license
 *    Copyright 2017 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
//
"use strict";
(function (opts) {
    var byu = window.byu = window.byu || {};
    var comps = byu.webCommunityComponents = window.byu.webCommunityComponents || {};
    var loading = comps.resourceLoading = comps.resourceLoading || {};

    var bundleToLoad = opts.bundle;

    if (needsPolyfills()) {
        ensureLoaded(opts.polyfills, function () {
            ensureLoaded(bundleToLoad);
        });
    } else {
        ensureLoaded(bundleToLoad);
    }

    function ensureLoaded(script, callback) {
        var resolved = resolveUrl(script);
        var cb = callback || function () {
            };
        var status = loading[resolved];
        if (status === 'done') {
            cb();
        } else if (!status) {
            loading[resolved] = createLoader(resolved, function () {
                loading[script] = 'done';
                cb();
            });
        } else if (status instanceof HTMLScriptElement) {
            status.addEventListener('load', function () {
                cb();
            });
        }
    }

    function createLoader(script, cb) {
        var scr = document.createElement('script');
        scr.src = script;
        scr.async = true;
        scr.onload = cb;
        document.head.appendChild(scr);
        return scr;
    }


    function needsPolyfills() {
        var forcePolyfills = comps.forcePolyfills;
        var needsPolyfills;

        //This is here because if we have multiple component bundles on the page and one of them has already loaded the
        //  polyfills, we would erroneously detect that we don't need to load them and load the native ES6 code instead
        //  (which could cause problems).  So, we set 'needsPolyfills' to tell ourselves to ignore the feature detection.
        if (!('needsPolyfills' in comps)) {
            var shadow = !!HTMLElement.prototype.attachShadow;
            var customElements = 'customElements' in window;
            needsPolyfills = comps.needsPolyfills = !shadow || !customElements;
        }
        return needsPolyfills || forcePolyfills;
    }

    function resolveUrl(url) {
//
        return url;
//
    }

//
})({
    polyfills: 'https://cdn.byu.edu/web-component-polyfills/latest/polyfills.min.js',
    bundle: 'https://cdn.byu.edu/byu-person-lookup/latest/byu-person-lookup-results-bundle.min.js',
    compatBundle: ''
});
