'use strict';
const Profile = require('./profile.json'); // todo stream ?

const nodesMap = new Map();

const parse = function (node, parentId) {

    if (parentId !== undefined) {
        node.parentId = parentId;
    }
    nodesMap.set(node.id, node);

    node.children.forEach((x) => {

        parse(x, node.id);
    });
};

parse(Profile.head);

const getCallChain = function (nodeId) {

    const node = nodesMap.get(nodeId);

    const res = [node.id];
    if (node.parentId !== undefined) {
        return getCallChain(node.parentId).concat(res);
    }
    return res;
};

const getName = (node) => `${node.functionName}` || `(${node.url}:${node.lineNumber})`;

const builtChain = Profile.samples.map((x) => getCallChain(x));

const reverseAndNormalize = function (table) {

    const ln = Math.max(...table.map((x) => x.length));
    const res = [];
    for (let i = 0; i < table.length; ++i) {
        for (let j = 0; j < ln; ++j) {

            if (res[j] === undefined) {
                res[j] = [];
            }
            res[j][i] = table[i][j] || -1;
        }
    }
    return res;
};

const chain  = reverseAndNormalize(builtChain);

const merge = function (ch) {

    let current = null;
    const result = [];
    for (let i = 0; i < ch.length; ++i) {
        result[i] = [];
        current = null;
        for (let j = 0; j < ch[i].length; ++j) {

            if (current === null) {
                current = { id: ch[i][j], count: 1 };
                continue;
            }
            if (current.id === ch[i][j]){
                current.count++;
                continue;
            }
            result[i].push(current);
            current = { id: ch[i][j], count: 1 };
        }
        result[i].push(current);
    }
    return result;
};

const merged = merge(chain);


const build = function (mergedChain) {

    for (let i = 1; i < mergedChain.length; ++i) {
        let rankInPreviousLine = 0;
        const previousLine = mergedChain[i - 1];
        const line = mergedChain[i];
        for (let j = 0; j < line.length; ++j) {

            if (line[j].id === -1) {
                continue;
            }
            const node = nodesMap.get(line[j].id);
            while (node.parentId !== previousLine[rankInPreviousLine].id) {
                rankInPreviousLine++;
            }
            previousLine[rankInPreviousLine].children = previousLine[rankInPreviousLine].children || [];
            previousLine[rankInPreviousLine].children.push(line[j]);
        }
    }
};
build(merged);
const root = merged[0][0];

const run = function (item) {

    const node = nodesMap.get(item.id);
    const res = {
        name: getName(node),
        value: item.count,
        id: item.id,
        children: (item.children || []).map((x) => run(x))
    };
    return res;
};

const finam = run(root);

finam.children.forEach((item) => {

    if (item.name.includes('idle')) {
        finam.value = finam.value - item.value + 10;
        item.value = 10;
    }
});

console.log(JSON.stringify(finam, null, 2))
