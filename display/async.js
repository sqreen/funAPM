'use strict';
const StreamArray = require('stream-json/utils/StreamArray');
const Path = require('path');
const Fs = require('fs');

const filename = Path.join(__filename, '..', '../async_logs.json');

const jsonStream = StreamArray.make();

const Node = class {

    constructor(id, type, stack) {
        this.id = id;
        this.type = type;
        this.stack = stack;
        this.children = [];
        this.fixedLength = 0;
        this.fixedDepth = 0;
    }

    addChild(node) {
        this.children.push(node);
    }

    build() {
        this.children = this.children.sort((a, b) => a.id - b.id);
        this.fixedLength = this.length;
        this.fixedDepth = this.depth;
    }
};

const nodeMap = new Map();
nodeMap.set(1, new Node(1, '', null));

jsonStream.output.on('data', function ({value}) {

    if (value === null) {
        return;
    }

    let node = nodeMap.get(value.asyncId);

    if (!node) {
        node = new Node(value.asyncId, value.type, value.stack);
    }
    else {
        node.type = value.type;
        node.stack = value.stack;
    }
    let parentNode = nodeMap.get(value.triggerAsyncId);
    if (!parentNode) {

        parentNode = new Node(value.triggerAsyncId);
        nodeMap.set(value.triggerAsyncId, parentNode);
    }
    parentNode.addChild(node);
    nodeMap.set(value.asyncId, node);
});

jsonStream.output.on('end', function () {

    const root = nodeMap.get(1);
    root.build();
});

Fs.createReadStream(filename)
    .pipe(jsonStream.input);
