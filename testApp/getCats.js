'use strict';
const Express = require('express');
const Mongoose = require('mongoose');

const app = Express();
Mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
Mongoose.Promise = global.Promise;

const Cat = Mongoose.model('Cat', { name: String });
const CatProto = Object.getPrototypeOf(Cat);
const find = CatProto.find;
CatProto.find = function (...args) {

    const res = find.apply(this, args);

    const exec = res.exec;
    res.exec = async function () {

        console.time('cat.find');
        try {
            const result = await exec.apply(this, arguments);
            console.timeEnd('cat.find');
            return result;
        }
        catch (err) {
            console.timeEnd('cat.find');
            throw err;
        }
    };
    return res;
};


app.get('/cats', async (req, res, next) => {

    try {
        const cats = await Cat.find().exec();
        return res.json(cats);
    }
    catch (e) {
        return next(e);
    }
});

app.listen(9090, () => {

    console.log('server running on port 9090');
});
