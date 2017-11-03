'use strict';
const AsyncHooks = require('async_hooks');

process.apm = process.apm || {};

const Context = require('./context');
const instrumentation = require('./instrumentation/index');

const hook = AsyncHooks.createHook({
    init(asyncId, type, triggerAsyncId) {

        Context.init(asyncId, type, triggerAsyncId);
    },
    destroy(asyncId) {

        Context.destroy(asyncId);
    }
});

hook.enable();

module.exports.start = function () {

    instrumentation.start();
};

if (module.id === 'internal/preload') {
    module.exports.start();
};
