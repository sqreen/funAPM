'use strict';
const Fs = require('fs');
const Path = require('path');
const measures = module.exports = new WeakMap();


const out = Fs.createWriteStream(Path.join(process.cwd(), 'apm_logs.json'));
out.write('[\n');
module.exports.end = function (req) {

    const data = measures.get(req);
    measures.delete(req);
    out.write(JSON.stringify(data) + ',\n');
};

const preExitHandler = function () {

    out.write('null\n]');
    out.end();
    process.exit();
};
// https://nodejs.org/api/process.html#process_event_beforeexit
// be fore exit, we logout sqreen
process.on('beforeExit', preExitHandler);
process.on('SIGINT', preExitHandler);
