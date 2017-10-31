'use strict';
const AsyncHooks = require('async_hooks');
const Http = require('http');

const Measures = require('./measures');

const context = new Map();

const emit = Http.Server.prototype.emit;
Http.Server.prototype.emit = function (type) {

    if (type === 'request') {
        const [req, res] = [arguments[1], arguments[2]];

        const timeStart = process.hrtime();

        const data = { url: req.url, method: req.method, startDate: new Date(), start: timeStart, duration: [0, 0], actions: [] };
        Measures.set(req, data);

        res.on('finish', () => {

            data.duration = process.hrtime(timeStart);
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
