let mongoose = require('mongoose');
let uuid = require('uuid/v4');

var schema = new mongoose.Schema({
	_id: {type: String, default: uuid},
	name: {type: String, requred: true},
	email: {type: String, requred: true},
	password: {type: String, requred: true},
	salt: {type: String, requred: true},
	status: {type: String, default: 'ACTIVE'},
	timestamp: {type: Number, default: new Date().getTime()},
	ip: String,
	user_agent: String,
	role: [String],
	security: {type: String, default: null},
	verification: {
		email: {
			status: {type: Boolean, default: false},
			timestamp: Number,
			token: String
		},
		phone: {
			status: {type: Boolean, default: false},
			timestamp: Number,
			otp: String
		}
	},
	kyc: {
		success: {type: Boolean, default: false},
		status: {type: String, default: 'PENDING'},
		requested_date: Number,
		update_date: Number,
		success_date: Number
	},
	password_reset: {
		token: String,
		timestamp: Number
	},
	two_fa: {
		secret_key: String,
		temp_secret_key: String,
		status: {type: Boolean, default: false},
		timestamp: Number
	},
	notification: {
		login: {type: Boolean, default: true}
	},
});

module.exports = mongoose.model('UserAccount', schema);