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