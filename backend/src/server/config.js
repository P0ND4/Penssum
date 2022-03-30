const express = require('express'); 
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const routes = require('../routes/');

module.exports = app => {
    // settings
    app.set('port', process.env.PORT || 8080);
    
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