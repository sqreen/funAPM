'use strict';
const Fs = require('fs');
const Path = require('path');
const AsyncHooks = require('async_hooks');

const out = Fs.createWriteStream(Path.join(process.cwd(), 'async_logs.json'));
out.write('[\n');

const hook = AsyncHooks.createHook({
    init(asyncId, type, triggerAsyncId) {

        out.write(JSON.stringify({ asyncId, type, triggerAsyncId, stack: (new Error()).stack }) + ',\n');
    }
});

hook.enable();

const preExitHandler = function () {

    out.write('null\n]');
    out.end();
    process.exit();
};
// https://nodejs.org/api/process.html#process_event_beforeexit
// be fore exit, we logout sqreen
process.on('beforeExit', preExitHandler);
process.on('SIGINT', preExitHandler);


