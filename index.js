let express = require('express');
let mongoose = require('mongoose');
let http = require('http');
let logger = require('morgan');
let bodyParser = require('body-parser');
let winston = require('winston');
let bluebird = require('bluebird');
let config = require('./config');
let cors = require('cors');
mongoose.Promise = bluebird;
let app = express();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

winston = winston.createLogger({
    transports: [
        new (winston.transports.Console)({'timestamp':true,'colorize': true})
    ]
});

mongoose.connect(config.db, {useNewUrlParser: true}, function(err) {
    if (err) {
        winston.log('error', "Mongodb connection error", {"message": err})
    } else {
        winston.log('info', "database connected")
    }
});

app.use('/' + config.api , require('./api/' + config.api + '/routes'));

var server = http.createServer(app);

server.listen(config.port, function (err) {
    if (err)
        winston.log('error', "Server error", {"message": err})
    else
        winston.log('info', 'server running at  ' + config.port);
});