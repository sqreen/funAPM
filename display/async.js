'use strict';
const StreamArray = require('stream-json/utils/StreamArray');
const Path = require('path');
const Fs = require('fs');

const filename = Path.join(__filename, '..', '../async_logs.json');

console.log(filename);

const jsonStream = StreamArray.make();


jsonStream.output.on('data', function ({index, value}) {

    if (value === null) {
        return;
    }

    console.log(value.asyncId, value.type)
    console.log(value.asyncId, value.stack)
});

jsonStream.output.on('end', function () {

});

Fs.createReadStream(filename)
    .pipe(jsonStream.input);
