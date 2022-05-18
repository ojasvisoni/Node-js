let validator = require("validator");
let uuid = require('uuid/v4');
let jwt = require("jsonwebtoken");
let rp = require("request-promise");
let ua = require("useragent");
ua(true);

//helpers
var response = require("../helpers/response");
var userUtil = require("./../helpers/users");
var emailUtil = require("../helpers/emails");

//models
var Users = require("../models/Users");
var Profile = require("../models/Profile");
var config = require("../../../config");

function Controller() {}

Controller.prototype.sendEmail = (req, res) => {

	if( typeof(req.query.email ) ) {
		//send email
		emailUtil.initMail("register", "text", {
			token: "user.verification.email.token",
			name: "Test Name",
			to: req.query.email,
			link: 'https://account.sonigator/verify_email?token=token_abc_123',
		}).then(function(info){
			if(info === true) {
				response.sendSuccess(res, "Registration Success");
			}else{
				//Users.delete(user._id);
				response.sendFail(res, "Failed to send email");
			}
		}).catch(function(e){
			//Users.delete(user._id);
			response.sendFail(res, "Failed to send email");
		});
	}else{
		response.sendFail(res, "No Email set");
	}

};

Controller.prototype.setProfile = (req, res) => {
	Users.getAll().then(function(users){
		users.forEach( function(user){
			Profile.addProfile(user).then(function(saved){
				console.log(saved);
			}).catch(function(err){
				console.log(err);
			});
		});

		response.sendSuccess(res, "Success");
	}).catch(function(err){
		response.sendFail(res, "Failed");
	})
};

Controller.prototype.verify_email = (req, res) => {
	if(!req.params.token) {
		response.sendNotFound(res, "Token not found");
	}else{
		var token = req.params.token;
		if(validator.isUUID(token)) {
			Users.email_verify(token).then(function(s){
				if(s === true){
					response.sendSuccess(res, "Email verification success");
				}else{
					response.sendFail(res, "Failed to verify email");
				}
			}).catch(function(){
				response.sendFail(res, "Failed to verify email");
			});
		}else{
			response.sendFail(res, "Invalid verification token");
		}
	}
};

Controller.prototype.register = (req, res) => {

	// only name, email, password required
	var _post = req.body;
	if( !_post.name || !_post.email || !_post.password || !_post.ip || !_post.user_agent) {
		response.sendFail(res, "All field required");
	}else{
		var data = {};
		_name = _post.name;
		_name = _name.split(" ");
		_is_name = true;
		_name.forEach(function(_n){
			if(!validator.isAlpha(_n)) _is_name = false;
		});
		var is_validated = true;
		var m = [];

		if(_is_name === true)
			data.name = _post.name;
		else{
			is_validated = false;
			m.push('name');
		}

		if(validator.isEmail(_post.email))
			data.email = _post.email;//validator.normalizeEmail(_post.email);
		else{
			is_validated = false;
			m.push("email");
		}
		data.password = _post.password;
		/*if(validator.matches(_post.password, '^.*(?=.{8,16})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$', 'i'))
			data.password = _post.password;
		else{
			is_validated = false;
			m.push("password");
		}*/

		if(is_validated){

			Users.is_email_exist(_post.email).then(function(found) {
				if(!found){
					data.salt = userUtil.createSalt();
					data.password = userUtil.createHash(data.password, data.salt);
					data.email_token = uuid();
					data.ip = validator.escape(_post.ip);
					data.user_agent = validator.escape(_post.user_agent);
					Users.add(data).then(function(user){

						if(!user){
							response.sendFail(res, "Failed to register new user");
						}else{
							Profile.addProfile(user).then(function(saved){

								//send email
								emailUtil.initMail("register", "text", {
									token: user.verification.email.token,
									name: user.name,
									to: user.email,
									subject: "Cointronix - Email Verification",
									link: 'https://account.cointronix.co/verify_email?token=' + user.verification.email.token,
								}).then(function(info){
									if(info === true) {
										response.sendSuccess(res, "Registration Success");
									}else{
										Users.delete(user._id);
										response.sendFail(res, "Failed to send email");
									}
								}).catch(function(e){
									Users.delete(user._id);
									response.sendFail(res, "Failed to send email");
								});

							}).catch(function(err){
								Users.delete(user._id);
								response.sendFail(res, err);
							});
							
						}
					}).catch(function(err){
						console.log(err);
						response.sendFail(res, err);	
					});
				}else{
					response.sendFail(res, "Email already exist");
				}
			}).catch(function(err){
				console.log(err);
				response.sendFail(res, "Server Error");
			});

		}else{
			response.sendFail(res, "Please check and validate " + m.toString());
		}

	}

};