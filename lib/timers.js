'use strict';
const Traces = require('./traces/index');
const Measures = require('./measures');
const Context = require('./context');

const traceMap = new Map();
const init = function (asyncId, type, triggerAsyncId) {

    if (!traceMap.has(triggerAsyncId)) {
        const arr = (new Error()).stack.split('\n');
        const trace = Traces.getTrace(arr);
        if (trace !== null) {
            traceMap.set(asyncId, trace);
            trace.t0 = process.hrtime();
        }
    }
    else {
        // we are already timing something, atm we time only one thing at a time
        const trace = traceMap.get(triggerAsyncId);
        if (trace.finisehd) {
            return;
        }
        traceMap.set(asyncId, trace);
        const arr = (new Error()).stack.split('\n');
        if (trace.isEnd(arr)) {
            trace.endId = asyncId;
            trace.finisehd = true;
        }
    }
};

const before = function (asyncId) {

    const trace = traceMap.get(asyncId);
    if (trace !== undefined && trace.endId === asyncId) {
        const req = Context.getContext();
        Measures.get(req).actions.push({
            name: trace.name,
            duration: process.hrtime(trace.t0)
        });
    }
};

const destroy = function (asyncId) {

    traceMap.delete(asyncId);
};

module.exports = { init, before, destroy };
