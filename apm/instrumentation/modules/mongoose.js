'use strict';
const PerfHook = require('perf_hooks');

const Uuidv4 = require('uuid/v4');

const Context = require('../../context');
const Measures = require('../../measures');

const targets = [ 'discriminator',
    'remove',
    'deleteOne',
    'deleteMany',
    'find',
    'findById',
    'findOne',
    'count',
    'where',
    'findOneAndUpdate',
    'findByIdAndUpdate',
    'findOneAndRemove',
    'findByIdAndRemove',
    'create',
    'insertMany',
    'update',
    'updateMany',
    'updateOne',
    'replaceOne'];

const wrap = function (holder, method, name) {

    const orig = holder[method];
    holder[method] = function (...args) {

        const uuid = Uuidv4();

        let done = false;
        if (typeof args.slice(-1) === 'function') {
            // we have a callback
            const cb = args.pop();
            args.push(function () {

                done = true;
                PerfHook.performance.mark(`end-${uuid}`);
                PerfHook.performance.measure(`${name}-${uuid}`, `start-${uuid}`, `end-${uuid}`);

                const measure = PerfHook.performance.getEntriesByName(`${name}-${uuid}`)[0];

                const measures = Measures.get(Context.getContext());
                measures.actions.push({ name, uuid, duration: measure.duration, startTime: measure.startTime });

                PerfHook.performance.clearMarks(`start-${uuid}`);
                PerfHook.performance.clearMarks(`end-${uuid}`);
                PerfHook.performance.clearMeasures(`${name}-${uuid}`);


                return cb.apply(this, arguments);
            })
        }

        PerfHook.performance.mark(`start-${uuid}`);
        const res = orig.apply(this, args);
        if (!done) {
            done = true;
            PerfHook.performance.mark(`end-${uuid}`);
            PerfHook.performance.measure(`${name}-${uuid}`, `start-${uuid}`, `end-${uuid}`);

            const measure = PerfHook.performance.getEntriesByName(`${name}-${uuid}`)[0];

            const measures = Measures.get(Context.getContext());
            measures.actions.push({ name, uuid, duration: measure.duration, startTime: measure.startTime });

            PerfHook.performance.clearMarks(`start-${uuid}`);
            PerfHook.performance.clearMarks(`end-${uuid}`);
            PerfHook.performance.clearMeasures(`${name}-${uuid}`);
        }
        return res;
    }
};

module.exports = function (mod) {

    const proto = Object.getPrototypeOf(mod);

    const Model = proto.Model;

    for (const target of targets) {
        wrap(Model, target, `monggose.${target}`);
    }

    wrap(Model.prototype, 'save', 'monggose.save');
    wrap(Model.prototype, 'remove', 'monggose.remove');

    return mod;
};
