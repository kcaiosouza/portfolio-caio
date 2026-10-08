(function () {
    var version = "1.1.3";
    var modules = [
        '/apps/vice-city/assets/modules/runtime.js',
        '/apps/vice-city/assets/modules/packages.js',
        '/apps/vice-city/assets/modules/loader.js',
        '/apps/vice-city/assets/modules/fs.js',
        '/apps/vice-city/assets/modules/audio.js',
        '/apps/vice-city/assets/modules/graphics.js',
        '/apps/vice-city/assets/modules/events.js',
        '/apps/vice-city/assets/modules/fetch.js',
        '/apps/vice-city/assets/modules/asm_consts.js',
        '/apps/vice-city/assets/modules/main.js'
    ];
    if (typeof importScripts === 'function') {
        var versionedModules = modules.map(function (m) { return m + '?v=' + version; });
        importScripts.apply(null, versionedModules);
    } else {
        var loadNext = function (i) {
            if (i < modules.length) {
                var s = document.createElement('script');
                s.src = modules[i] + '?v=' + version;
                s.async = false; // Ensure order
                s.onload = function () { loadNext(i + 1); };
                s.onerror = function () { console.error('Failed to load module: ' + modules[i]); };
                document.body.appendChild(s);
            }
        };
        loadNext(0);
    }
})();