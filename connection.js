var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost/trapit';


mongoose.connect(mongoDB,{ useMongoClient: true });
var db = mongoose.connection;


module.exports = db;