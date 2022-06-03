let mongoose = require('mongoose');
let uuid = require('uuid/v4');

var schema = new mongoose.Schema({
	_id: {type: String, default: uuid},
	name: {type: String, required: true},
	type: {type: String, required: true},
	subject: {type: String, required: true},
	body: {type: String, required: true}
});

module.exports = mongoose.model('EmailTemplates', schema);