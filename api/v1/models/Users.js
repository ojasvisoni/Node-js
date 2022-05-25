let bluebird = require("bluebird");
let uuid = require('uuid/v4');
let qrcode = require("qrcode");
let speakeasy = require("speakeasy");
let ua = require("useragent");
ua(true);
//Load Schemas
let UserAccount = require("./../../../schemas/UserAccount");
let UserLogin = require("./../../../schemas/UserLogin");

module.exports = {
	add: (data) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount({
				name: data.name,
				email: data.email,
				password: data.password,
				salt: data.salt,
				ip: data.ip,
				user_agent: data.user_agent,
				role: ['USER'],
				"verification.email.token": data.email_token
			}).save().then(function (user) {
				if (user) {
					resolve(user);
				} else {
					console.log("User: ", user);
					reject("Failed to add user. Try again later");
				}
			}).catch(function (err) {
				console.log(err);
				reject("Failed to add user. Try again later");
			});
		});
	},

	"get": (obj) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne(obj).then(function (user) {
				if (user) {
					resolve(user);
				} else {
					reject(false);
				}
			}).catch(function (err) {
				console.log(err);
				reject(false);
			});
		});
	},

	getAll: () => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.find({}, { _id: 1, name: 1, email: 1 }).then(function (user) {
				if (user) {
					resolve(user);
				} else {
					reject(false);
				}
			}).catch(function (err) {
				console.log(err);
				reject(false);
			});
		});
	},

	delete: (id) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.deleteOne({ _id: id }).then(function () {
				resolve(true);
			}).catch(function (err) {
				console.log("User delete", err);
				reject(false);
			});
		});
	},

	login: (obj) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserLogin(obj).save().then(function (login) {
				if (login) {
					resolve(true);
				} else {
					reject(false);
				}
			}).catch(function (err) {
				console.log("Login", err);
				reject(false);
			});
		});
	},

	email_verify: (token) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne({ "verification.email.token": token }).then(function (user) {
				if (user) {
					user.verification.email.token = null;
					user.verification.email.status = true;
					user.verification.email.timestamp = new Date().getTime();

					user.save().then(function () {
						resolve(true);
					}).catch(function (err) {
						console.log(err);
						reject(false);
					});
				} else {
					console.log("User: ", user);
					reject(false);
				}
			}).catch(function (err) {
				console.log(err);
				reject(false);
			});
		});
	},

	create_password_reset: (email) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne({ email: email }).then(function (user) {
				if (user) {
					var token = uuid();
					user.password_reset.token = token;
					user.password_reset.timestamp = new Date().getTime();

					user.save().then(function () {
						resolve({
							email: user.email,
							name: user.name,
							token: token
						});
					}).catch(function (err) {
						console.log(err);
						reject("Failed to reset password");
					})
				} else {
					reject("Email not registered");
				}
			}).catch(function (err) {
				console.log(err);
				reject("Invalid email");
			});
		});
	},

	password_reset: (token, password, util) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne({ "password_reset.token": token }).then(function (user) {
				if (user) {
					var hash = util.createHash(password, user.salt);
					user.password = hash;

					user.save().then(function () {
						resolve(true);
					}).catch(function () {
						reject("Password reset failed");
					});
				} else {
					reject("Invalid token");
				}
			}).catch(function (err) {
				console.log("password reset", err);
				reject("Invalid token");
			});
		});
	},

	account: (user_id) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne({ _id: user_id }).then(function (user) {
				var data = {
					status: user.status,
					registered_on: user.timestamp,
					last_login: null,
					logins: null,
					user_id: user._id,
					name: user.name,
					email: user.email,
					security: user.security,
					email_status: user.verification.email.status,
					phone_status: user.verification.phone.status,
					notification: user.notification,
				};

				UserLogin.find({ user_id: user._id }, { _id: 0, __v: 0, user_id: 0 }, { sort: { timestamp: -1 }, limit: 10 }).then(function (logins) {
					if (logins && logins.length) {
						logins.forEach(function (login) {
							login.user_agent = ua.parse(login.user_agent).toString()
						});

						data.last_login = logins[0].timestamp;
						data.logins = logins;
					}
					resolve(data);
				}).catch(function (err) {
					console.log(err);
					resolve(data);
				})
			}).catch(function (err) {
				console.log(err);
				reject("Some error occured!");
			});
		});
	},

	find_by_id: (id) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne({ _id: id }, { status: 1, _id: 1, email: 1, name: 1 }).then(function (user) {
				if (user) {
					resolve(user);
				} else {
					reject(false);
				}
			}).catch(function (err) {
				console.log(err);
				reject(false);
			});
		});
	},

	change_password: (obj, util) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne({ _id: obj.id }).then(function (user) {
				var old = util.createHash(obj.old, user.salt);
				if (old === user.password) {
					var new_p = util.createHash(obj.new, user.salt);
					user.password = new_p;
					user.save().then(function () {
						resolve("Password Changed");
					}).catch(function (err) {
						reject("Failed to change password");
					});
				} else {
					reject("Old password is incorrect");
				}
			}).catch(function (err) {
				console.log(err);
				reject("User not found");
			});
		});
	},

	setup_2fa: (user_id) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne({ _id: user_id }).then(function (user) {
				if (user && user.two_fa.status) {
					reject("2FA already setup. If you are facing some problem remove it first and setup again");
				} else {
					var secret = speakeasy.generateSecret();
					var url = speakeasy.otpauthURL({ secret: secret.ascii, label: `Cointronix Beta (${user.email})`, algorithm: "sha512" });
					user.two_fa.temp_secret_key = secret.base32;
					user.save().then(function (saved) {
						if (saved) {
							resolve({ success: true, qrcode: url });
						} else {
							reject("Failed to setup 2fa now. Try again later");
						}
					}).catch(function (err) {
						console.log(err);
						reject("Failed to setup 2fa now. Try again later");
					});
				}
			}).catch(function (err) {
				console.log(err);
				reject("User not found error");
			});
		});
	},

	verify_2fa: (user_id, token) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne({ _id: user_id }).then(function (user) {
				var verified = speakeasy.totp.verify({
					secret: user.two_fa.temp_secret_key,
					token: token,
					encoding: "base32"
				});

				if (verified) {
					user.two_fa.secret_key = user.two_fa.temp_secret_key;
					user.two_fa.temp_secret_key = null;
					user.two_fa.status = true;
					user.two_fa.timestamp = new Date().getTime();
					user.security = '2FA';

					user.save().then(function () {
						resolve(true);
					}).catch(function (err) {
						console.log(err);
						reject(false);
					});
				} else {
					reject(false);
				}
			}).catch(function (err) {
				console.log(err);
				reject(false);
			});
		});
	},

	check_2fa: (user_id, token) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne({ _id: user_id }).then(function (user) {
				var verified = speakeasy.totp.verify({
					secret: user.two_fa.secret_key,
					token: token,
					encoding: "base32"
				});

				if (verified) {
					resolve({ user_id: user._id, name: user.name });
				} else {
					reject(false);
				}
			}).catch(function (err) {
				console.log(err);
				reject(false);
			});
		});
	},

	generateOtp: (length) => {
		var character = "0123456789";
		var charlen = strlen(character);
		var return_val = " ";

		for (var i = 0; i < length; i++) {
			return_val = character(Math.rand(0, charlen - 1));
		}

		return return_val;
	},

	sendtoOtp: (phone_no, otp) => {
		// Used MSG91 API


		
		var result = '';
		if (result != "") {
			return ["status", true];
		} else {
			return ["status", false];
		}

	},

	remove_2fa: (user_id) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOne({ _id: user_id }).then(function (user) {
				user.two_fa.status = false;
				user.two_fa.temp_secret_key = null;
				user.two_fa.secret_key = null;
				user.security = null;

				user.save().then(function () {
					resolve(true);
				}).catch(function (err) {
					console.log(err);
					reject(false);
				});
			}).catch(function (err) {
				console.log(err);
				reject(false);
			});
		});
	},

	is_email_exist: (email) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.find({ email: email }).then(function (users) {
				if (users && users.length) {
					resolve(true);
				} else {
					resolve(false);
				}
			}).catch(function (err) {
				console.log(err);
				resolve(false);
			});
		});
	},

	update: (id, set) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.findOneAndUpdate({ _id: id }, set).then(function (user) {
				if (user) {
					resolve(true);
				} else {
					resolve(false);
				}
			}).catch(function (err) {
				console.log(err);
				resolve(false);
			});
		});
	},

	deactivateAccount: (user_id) => {
		return new bluebird.Promise(function (resolve, reject) {
			UserAccount.update({ _id: user_id }, { $set: { status: "INACTIVE" } }).then(function (user) {
				if (user) {
					resolve(true);
				} else {
					reject("Failed to deactivate account");
				}
			}).catch(function (err) {
				console.log(err);
				reject("Failed to deactivate account");
			});
		});
	},
};