'use strict';
const Profile = require('./profile.json'); // todo stream ?


const transform = function (node) {

    const res = {};
    res.name = `${node.url}:${node.lineNumber} - ${node.functionName} - ` + Math.random();
    res.children = node.children.map((x) => transform(x));
    res.value = node.hitCount + res.children.map((x) => x.value).filter(Boolean).reduce((a, b) => a + b, 0);

    if (node.functionName.includes('idle')) {
        // console.log(node)
        res.value = 1
    }

    if (isNaN(res.value) ){
        console.log(node.hitCount)
        console.log(res.children)
        console.log(res.children.reduce((a, b) => a.value + b.value, 0))
        throw ''
    }

    return res;
};
// transform(Profile.head)
console.log(JSON.stringify(transform(Profile.head)));