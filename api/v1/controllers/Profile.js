let validator = require("validator");
let multer = require("multer");
let uuid = require("uuid/v4");

//helpers
var response = require("./../helpers/response");
var userUtil = require("./../helpers/users");
var emailUtil = require("./../helpers/emails");

//models
var Users = require("./../models/Users");
var Profile = require("./../models/Profile");
var config = require("./../../../config");
var Transfers = require("./../models/Transfers");

var file_storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, "./public");
	},
	filename: function(req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now() + "-" + validator.escape(file.originalname));
	}
});

var upload = multer({
	storage: file_storage
});

function Controller() {}

Controller.prototype.account = (req, res) => {
	if(!req.auth.user_id) {
		response.sendFail(res, "Unauthorised access!");
	}else{
		Users.account(req.auth.user_id).then(function(account){
			response.sendSuccess(res, "Account Info", account);
		}).catch(function(err){
			response.sendFail(res, err);
		});
	}
};

Controller.prototype.change_password = (req, res) => {
	if(!req.auth.user_id) {
		response.sendFail(res, "Unauthorised access!");
	}else{
		if(!req.body.old_password || !req.body.new_password) {
			response.sendFail(res, "Old/New Password required");
		}else{
			Users.change_password({id: req.auth.user_id, new: req.body.new_password, old: req.body.old_password}, userUtil).then(function(){
				response.sendSuccess(res, "Password changed");
			}).catch(function(err){
				response.sendFail(res, err);
			});
			
		}
	}
};