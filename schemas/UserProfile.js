let mongoose = require('mongoose');
let uuid = require('uuid/v4');

var schema = new mongoose.Schema({
	_id: {type: String, default: uuid},
	user_id: {type: String, requred: true},
	name: {type: String, required: true},
	email: {type: String, required: true},
	phone: {
		isd: String,
		number: String
	},
	date_of_birth: {type: Number, default: 0},
	gender: String,
	address: {
		address: String,
		line1: String,
		line2: String,
		state: String,
		country: String,
		zip: Number
	}
});

module.exports = mongoose.model('UserProfile', schema);