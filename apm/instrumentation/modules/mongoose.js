'use strict';
const PerfHook = require('perf_hooks');

const Uuidv4 = require('uuid/v4');

const Context = require('../../context');
const Measures = require('../../measures');

module.exports = function (mod) {

    const proto = Object.getPrototypeOf(mod);

    const exec = proto.Query.prototype.exec;

    proto.Query.prototype.exec = async function () {

        const uuid = Uuidv4();

        const name = `mongoose.${this.op}`;

        PerfHook.performance.mark(`start-${uuid}`);
        const res = await exec.apply(this, arguments);
        PerfHook.performance.mark(`end-${uuid}`);
        PerfHook.performance.measure(`${name}-${uuid}`, `start-${uuid}`, `end-${uuid}`);

        const measure = PerfHook.performance.getEntriesByName(`${name}-${uuid}`)[0];

        const reqData = Measures.get(Context.getContext());
        reqData.actions.push({ name, uuid, duration: measure.duration, startTime: measure.startTime });

        PerfHook.performance.clearMarks(`start-${uuid}`);
        PerfHook.performance.clearMarks(`end-${uuid}`);
        PerfHook.performance.clearMeasures(`${name}-${uuid}`);
        return res;
    };

    const Model = proto.Model;

    // todo wrap save

/*
    for (const target of targets) {
        wrap(Model, target, `monggose.${target}`);
    }

    wrap(Model.prototype, 'save', 'monggose.save');
    wrap(Model.prototype, 'remove', 'monggose.remove');*/

    return mod;
};
