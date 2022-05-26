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

	user: (req, res, next) => {
		var token = req.headers['x-user-token'];
		if(token) {
			jwt.verify(token, config.jwtkey, function(err, decoded){
				if(err){
					response.sendFail(res, "User authentication failed");
				}else{

					Users.find_by_id(decoded.id).then(function(user){
						if(user && user.status == 'ACTIVE') {
							req.auth = {user_id: user._id, name: user.name, email: user.email};
							next();
						}else{
							response.sendFail(res, "Account is temporarily inactive. Contact Admin");
						}
					}).catch(function(err){
						response.sendFail(res, "User authentication failed");
					});
				}
			});
		}else{
			response.sendFail(res, "User authentication token required");
		}
	},

};