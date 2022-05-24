let jwt = require('jsonwebtoken');
let config = require("../../../config");
let response = require("../helpers/response");
let Users = require("../models/Users");

module.exports = {

	header: (req, res, next) => {
		var token = req.headers['x-access-token'];
		if(token === config.access_token) {
			next();
		}else{
			response.sendFail(res, "API access denied.", {reason: "Header token invalid or not present"});
		}
	},

};