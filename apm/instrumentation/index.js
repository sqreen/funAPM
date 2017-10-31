'use strict';
const Module = require('module');

const Hooks = require('./hooks');

module.exports.start = function () {

    const load = Module._load;
    Module._load = function (request, parent) {

        const res = load.apply(this, arguments);

        if (Hooks.hasOwnProperty(request)) {

            return Hooks[request](res);
        }
        return res;
    }


};
