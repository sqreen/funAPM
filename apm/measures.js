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

    const page = Fs.readFileSync(Path.join(__dirname, '../viewAssets/viewer.html')).toString();
    const res =  page.replace('var input = [];', 'var input = ' + Fs.readFileSync(Path.join(process.cwd(), 'apm_logs.json')));

    Fs.writeFileSync(Path.join(process.cwd(), 'view.html'), res);

    process.exit();
};
// https://nodejs.org/api/process.html#process_event_beforeexit
// be fore exit, we logout sqreen
process.on('beforeExit', preExitHandler);
process.on('SIGINT', preExitHandler);
