'use strict';
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

        let t0;
        let done = false;
        if (typeof args.slice(-1) === 'function') {
            // we have a callback
            const cb = args.pop();
            args.push(function () {

                done = true;
                const duration = process.hrtime(t0);
                Context.getContext().actions.push({ name, duration });
                return cb.apply(this, arguments);
            })
        }

        t0 = process.hrtime();
        const res = orig.apply(this, args);
        if (!done) {
            done = true;
            const duration = process.hrtime(t0);
            const measure = Measures.get(Context.getContext());
            measure.actions.push({ name, duration });
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
