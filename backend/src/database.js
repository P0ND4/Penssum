const mongoose = require('mongoose');
const { database } = require('./keys');

mongoose.connect(database.URI)
    .then(res => console.log('The database has been successfully connected'))
    .catch(err => console.log(err));