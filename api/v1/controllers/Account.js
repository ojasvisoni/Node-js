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
		if(validator.matches(_post.password, '^.*(?=.{8,16})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "]).*$', 'i'))
			data.password = _post.password;
		else{
			is_validated = false;
			m.push("password");
		}

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
									subject: "Sonigator - Email Verification",
									link: 'https://sonigator.com/verify_email?token=' + user.verification.email.token,
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

Controller.prototype.login = (req, res) => {
	if(!req.body.email || !req.body.password || !req.body.ip || !req.body.user_agent) {
		response.sendFail(res, "Email/Password missing");
	}else{
		if(validator.isEmail(req.body.email)){
			var email = req.body.email;
			//validator.normalizeEmail(req.body.email);
			//validator.matches(req.body.password, '^.*(?=.{8,16})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&?_ "]).*$', 'i')
			if(true){
				Users.get({email: email}).then(function(user){
					if(user && user.status === 'ACTIVE') {
						var hpass = userUtil.createHash(req.body.password, user.salt);
						if(hpass === user.password) {

							if( user.notification.login ){
								emailUtil.initMail("login_notice", "text", {
									name: user.name,
									to: user.email,
									subject: "Account login information",
									datetime: new Date().toLocaleString(),
									ipaddress: req.body.ip,
									browserinfo: ua.parse( req.body.user_agent ).toAgent()
								}).then(function(info){
									console.log( "Login Mail", info );
								}).catch(function(e){
									console.log( "Login Mail", e );
								});
							}
							if((typeof(user.security) == 'undefined' || user.security === null)) {
								jwt.sign({name: user.name, id: user._id, email: email}, config.jwtkey, {expiresIn: 3600 * 24 * 7}, function(err, token){
									if(err){
										response.sendFail(res, "Login failed, try again!");
									}else{
										rp({
											url: "http://ip-api.com/json/" + req.body.ip,
											json: true,
											method: "GET"
										}).then(function(ipinfo){
											Users.login({user_id: user._id, ip: req.body.ip, user_agent: req.body.user_agent, city: info.city, country: ipinfo.country});
											response.sendSuccess(res, "Login Success", {
												token: token,
												user_id: user._id,
												name: user.name,
												email: email
											});
										}).catch(function(e){
											console.log("IP info", e);
											response.sendFail(res, "Failed. Try Again!");
										});
									}
								});
							}else{
								response.sendSuccess(res, "Login Success", {
									user_id: user._id,
									name: user.name,
									next: user.security,
									email: email
								});	
							}
						}else{
							response.sendFail(res, "Either Email Id or Password is incorrect. Please try again");
						}
					}else{
						response.sendFail(res, "Account temporarily deactivated. Please contact Sonigator Support.");
					}
				}).catch(function(err){
					response.sendFail(res, "No registered email found");
				});
			}else{
				response.sendFail(res, "Password is not valid");	
			}
		}else{
			response.sendFail(res, "Email is not valid");
		}
	}


	Controller.prototype.login_with_2fa = (req, res) => {
		if( !req.body.user_id || !req.body.code_2fa || !req.body.ip || !req.body.user_agent) {
			response.sendFail(res, "User/Code is required");
		}else{
			var user_id = req.body.user_id;
			var code_2fa = Number( req.body.code_2fa );
	
			if(validator.isUUID( user_id )){
				if( code_2fa > 99999 && code_2fa < 1000000 ){
					Users.check_2fa( req.body.user_id, code_2fa ).then(function(data) {
						jwt.sign({name: data.name, id: data.user_id}, config.jwtkey, {expiresIn: 3600 * 24 * 7}, function(err, token){
							if(err){
								response.sendFail(res, "Login failed, try again!");
							}else{
								Users.login({user_id: data.user_id, ip: validator.escape(req.body.ip), user_agent: validator.escape(req.body.user_agent)});
								response.sendSuccess(res, "Login Success", {
									token: token,
									user_id: data.user_id,
									name: data.name
								});
							}
						});	
					}).catch(function(err){
						response.sendFail(res, "2FA code is incorrect");
					});
				}else{
					response.sendFail(res, "Invalid Code");
				}
			}else{
				response.sendFail(res, "Invalid User id");
			}
		}
	};
	

};