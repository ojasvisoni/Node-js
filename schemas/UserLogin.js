let mongoose = require('mongoose');
let uuid = require('uuid/v4');

var schema = new mongoose.Schema({
	_id: {type: String, default: uuid},
	user_id: String,
	timestamp: {type: Number, default: new Date().getTime()},
	ip: String,
	user_agent: String,
	city: String,
	country: String
});

module.exports = mongoose.model('UserLogin', schema);