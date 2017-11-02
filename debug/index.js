'use strict';
const Fs = require('fs');
const Path = require('path');
const AsyncHooks = require('async_hooks');
const profiler = require('v8-profiler');

const fs = require('fs');
const util = require('util');

function debug(...args) {
    // use a function like this one when debugging inside an AsyncHooks callback
    fs.writeSync(1, `${util.format(...args)}\n`);
}

const Line = class {

    constructor(asyncId, type, triggerAsyncId, stack) {

        this.asyncId = asyncId;
        this.type = type;
        this.triggerAsyncId = triggerAsyncId;
        this.stack = stack;
        this.hrtimeStart = process.hrtime();
        this.duration = [0, 0];
    }

    end() {

        this.duration = process.hrtime(this.hrtimeStart);
    }
};

const asyncMap = new Map();

const getLine = function (asyncId, type = 'ROOT', triggerAsyncId = 0, stack = '') {

    let line = asyncMap.get(asyncId);
    if (line) {
        if (line.type === 'ROOT' && type !== 'ROOT') {
            line.type = type;
        }
        return line;
    }
    line = new Line(asyncId, type, triggerAsyncId, stack);
    asyncMap.set(asyncId, line);
    return line;
};


const hook = AsyncHooks.createHook({
    init(asyncId, type, triggerAsyncId) {

        const stack = (new Error()).stack;
        getLine(triggerAsyncId);
        getLine(asyncId, type, triggerAsyncId, stack);
    },
    before(asyncId) {

        const line = getLine(asyncId);
        line.end();
    }
});

hook.enable();

const preExitHandler = function () {

    const result = [];
    for (const line of asyncMap.values()) {
        result.push(line);
    }
    Fs.writeFileSync(Path.join(process.cwd(), 'async_logs.json'), JSON.stringify(result));
    var profile = profiler.stopProfiling('');
    fs.writeFileSync('profile.json', JSON.stringify(profile));
    process.exit(0);
};
// https://nodejs.org/api/process.html#process_event_beforeexit
// be fore exit, we logout sqreen
process.on('beforeExit', preExitHandler);
process.on('SIGINT', preExitHandler);

profiler.startProfiling('', true);

