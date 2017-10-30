'use strict';


const fs = require('fs');
const util = require('util');

function debug(...args) {
    // use a function like this one when debugging inside an AsyncHooks callback
    fs.writeSync(1, `${util.format(...args)}\n`);
}

const TraceData = require('./traces.json');

const Trace = class {

    constructor() {
        this.endId = -1;
        this.finished = false;
    }
};

const getTraceClass = function (traceData) {

    return class extends Trace {

        constructor() {
            super();
            this.name = traceData.name;
        }

        isEnd(arr) {

            if (traceData.stop.endswith) {

                return arr[traceData.stop.rank].endsWith(traceData.stop.endswith);
            }
        }
    }
};


const traceIndex = [];

TraceData.forEach((item) => {

    const cl = getTraceClass(item);
    traceIndex.push((arr) => {

        const reg = new RegExp(item.start.regexp);
        // debug(arr)
        if (!!reg.exec(arr[item.start.rank])) {

            return new cl();
        }
        return null;
    });
});


module.exports.getTrace = function (arr) {

    for (const getTrace of traceIndex ) {

        const trace = getTrace(arr);
        if (trace !== null) {
            return trace
        }
    }
    return null;
};
