'use strict';
const PerfHook = require('perf_hooks');

const Uuidv4 = require('uuid/v4');

const Context = require('../../context');
const Measures = require('../../measures');

const wrapAsync = function (orig, name) {

    return async function () {

        const uuid = Uuidv4();

        name = name || `mongoose.${this.op}`;

        PerfHook.performance.mark(`start-${uuid}`);

        const finish = function () {
            PerfHook.performance.measure(`${name}-${uuid}`, `start-${uuid}`, `end-${uuid}`);

            const measure = PerfHook.performance.getEntriesByName(`${name}-${uuid}`)[0];

            const reqData = Measures.get(Context.getContext());
            reqData.actions.push({ name, uuid, duration: measure.duration, startTime: measure.startTime });

            PerfHook.performance.clearMarks(`start-${uuid}`);
            PerfHook.performance.clearMarks(`end-${uuid}`);
            PerfHook.performance.clearMeasures(`${name}-${uuid}`);
        };

        try {
            const res = await orig.apply(this, arguments);
            PerfHook.performance.mark(`end-${uuid}`);
            finish();
            return res;
        }
        catch (err) {
            PerfHook.performance.mark(`end-${uuid}`);
            finish();
            throw err;
        }


    }
};

module.exports = function (mod) {

    const proto = Object.getPrototypeOf(mod);

    const exec = proto.Query.prototype.exec;

    proto.Query.prototype.exec = wrapAsync(exec);

    const Model = proto.Model;

    const remove = Model.prototype.remove;
    Model.prototype.remove = wrapAsync(remove, 'mongoose.remove');

    const save = Model.prototype.save;
    Model.prototype.save = wrapAsync(save, 'mongoose.save');

    return mod;
};
