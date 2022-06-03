let bluebird = require("bluebird");
//load Schema
let UserAccount = require("./../../../schemas/UserAccount");
let UserLogin = require("./../../../schemas/UserLogin");
let UserProfile = require("./../../../schemas/UserProfile");

module.exports = {

	getProfile: (user_id) => {
		return new bluebird.Promise(function(resolve, reject){
			UserProfile.findOne({user_id: user_id}, {_id: 0}).then(function(profile){
				if(profile){
					resolve(profile);
				}else{
					reject("No user found with given ID");
				}
			}).catch(function(err){
				console.log(err);
				reject("Failed to get user profile");
			});
		});
	},

	updateProfile: (user_id, data) => {
		return new bluebird.Promise(function(resolve, reject){

			UserProfile.findOneAndUpdate({user_id: user_id}, {$set: data}).then(function(saved){
				if(saved){
					resolve(true);
				}else{
					reject("Failed to update profile");	
				}
			}).catch(function(err){
				console.log(err);
				reject("Failed to update profile");
			});

		});
	},

	addProfile: (user) => {
		return new bluebird.Promise(function(resolve, reject){
			UserProfile({user_id: user._id, name: user.name, email: user.email}).save().then(function(saved){
				if(saved){
					resolve(true);
				}else{
					reject("Failed to saved profile");
				}
			}).catch(function(err){
				console.log(err);
				reject("Failed to saved profile");
			});
		});
	},

	notification: (user_id, status) => {
		return new bluebird.Promise(function(resolve, reject){
			UserAccount.update({_id: user_id}, {$set: {"notification.login": status}}).then(function(updated){
				if(updated){
					resolve(true);
				}else{
					reject("Failed to update notification setting");
				}
			}).catch(function(err){
				console.log(err);
				reject("Something went wrong while updating.");
			});
		});
	},
	
};