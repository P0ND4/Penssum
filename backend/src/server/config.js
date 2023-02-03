const express = require('express'); 
const mkdirp = require('mkdirp');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const routes = require('../routes/');

module.exports = app => {
    // settings
    app.set('port', process.env.PORT || 8080);
    
    // create folders if not exists
    mkdirp(path.resolve('src/public/improvementComment'));
    mkdirp(path.resolve('src/public/optimize'));
    mkdirp(path.resolve('src/public/quotes'));
    mkdirp(path.resolve('src/public/report'));

    // Middleware
    app.use(cors());
    app.use(morgan('dev'));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    
    //Static files
    app.use(express.static(path.join(__dirname, '../public')));

    // Routes
    routes(app);

    return app;
};