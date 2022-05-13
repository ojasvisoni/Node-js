let validator = require("validator");
let uuid = require('uuid/v4');
let jwt = require("jsonwebtoken");
let rp = require("request-promise");
let ua = require("useragent");
ua(true);

//helpers
var response = require("./../helpers/response");
var userUtil = require("./../helpers/users");
var emailUtil = require("./../helpers/emails");

//models
var Users = require("./../models/Users");
var Profile = require("./../models/Profile");
var config = require("./../../../config");

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