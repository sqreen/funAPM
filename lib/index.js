'use strict';

const fs = require('fs');
const util = require('util');

function debug(...args) {
    // use a function like this one when debugging inside an AsyncHooks callback
    fs.writeSync(1, `${util.format(...args)}\n`);
}

const AsyncHooks = require('async_hooks');

process.apm = process.apm || {};

const Context = require('./context');
const Timers = require('./timers');

const hook = AsyncHooks.createHook({
    init(asyncId, type, triggerAsyncId) {

        Context.init(asyncId, type, triggerAsyncId);
        Timers.init(asyncId, type, triggerAsyncId);
    },
    before(asyncId) {

        // here: AsyncHooks.executionAsyncId() === asyncId;;
        Timers.before(asyncId);
    },
    destroy(asyncId) {

        Context.destroy(asyncId);
        Timers.destroy(asyncId);
    }
});

hook.enable();
