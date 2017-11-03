'use strict';
const AsyncHooks = require('async_hooks');
const Http = require('http');
const PerfHook = require('perf_hooks');

const Uuidv4 = require('uuid/v4');


const Measures = require('./measures');

const context = new Map();

const emit = Http.Server.prototype.emit;
Http.Server.prototype.emit = function (type) {

    if (type === 'request') {
        const [req, res] = [arguments[1], arguments[2]];

        req.apm = {};
        req.apm.uuid = Uuidv4();

        PerfHook.performance.mark(`start-${req.apm.uuid}`);

        const data = { uuid: req.apm.uuid, url: req.url, method: req.method, startDate: new Date(), startTime: 0, duration: 0, actions: [] };
        Measures.set(req, data);

        res.on('finish', () => {

            PerfHook.performance.mark(`end-${req.apm.uuid}`);
            PerfHook.performance.measure(`request-${req.apm.uuid}`, `start-${req.apm.uuid}`, `end-${req.apm.uuid}`);
            const measure = PerfHook.performance.getEntriesByName(`request-${req.apm.uuid}`)[0];


            PerfHook.performance.clearMarks(`start-${req.apm.uuid}`);
            PerfHook.performance.clearMarks(`end-${req.apm.uuid}`);
            PerfHook.performance.clearMeasures(`request-${req.apm.uuid}`);

            data.startTime = measure.startTime;
            data.duration = measure.duration;
            Measures.end(req);
        });

        const id = AsyncHooks.executionAsyncId();
        context.set(id, req);
    }

    return emit.apply(this, arguments);
};

const init = function (asyncId, type, triggerAsyncId) {

    if (context.has(triggerAsyncId)) {
        context.set(asyncId, context.get(triggerAsyncId));
    }
};

const destroy = function (asyncId) {

    if (context.has(asyncId)) {
        context.delete(asyncId);
    }
};

const getContext = function (asyncId = AsyncHooks.executionAsyncId()) {

    return context.get(asyncId);
};

module.exports = { init, destroy, getContext };
