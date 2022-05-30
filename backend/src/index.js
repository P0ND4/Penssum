require('dotenv').config();
const http = require('http');
const express = require('express');

const config = require('./server/config');
const socket = require('./server/socket');

// Database
require('./database');

// Starting the server
const app = config(express());
const server = http.createServer(app);
socket(server);

// Listening to the server
server.listen(app.get('port'), () => {
    console.log('Server on port: ', app.get('port'));
});