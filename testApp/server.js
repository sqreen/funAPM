'use strict';
require('../lib/index').start();

const Express = require('express');
const Mongoose = require('mongoose');
const BodyParser = require('body-parser');

const parseJSON = BodyParser.json();


const app = Express();
Mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
Mongoose.Promise = global.Promise;

const Cat = Mongoose.model('Cat', { name: String });

app.use(function(err, req, res, next) {

    console.error(err);
    return next(err);
});

app.post('/cats', parseJSON, (req, res, next) => {

    if (typeof req.body.name !== 'string') { // TODO: use celbrate somedays
        const err = new Error('wrong body format');
        return setTimeout(() => next(err));
    }
    const kitty = new Cat({ name: req.body.name });
    kitty.save(function (err) {
        if (err) {
            return next(err);
        } else {
            res.status(201);
            return res.end('');
        }
    });
});

app.get('/destroyrandom', async (req, res, next) => {

    try  {
        const kitten = await Cat.find().exec();
        const rank = Math.floor(Math.random() * kitten.length);
        const kitty = kitten[rank];
        await kitty.remove();
        res.status(200);
        return res.end('');
    }
    catch (e) {
        return next(e);
    }
});

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
