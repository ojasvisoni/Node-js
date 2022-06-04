let bluebird = require("bluebird");

let UserKYC = require("./../../../schemas/UserKYC");

module.exports = {

	getUserKyc: (user_id) => {
		return new bluebird.Promise(function(resolve, reject){
			UserKYC.findOne({user_id: user_id}, {_id: 0, __v: 0}).then(function(kyc){
				if(kyc) {
					resolve(kyc);
				}else{
					reject("KYC not submitted yet");
				}
			}).catch(function(err){
				console.log(err);
				reject("Something went wrong");
			})
		});
	},

	getKycStatus: (user_id) => {
		return new bluebird.Promise(function(resolve, reject){
			UserKYC.findOne({user_id: user_id}, {status: 1}).then(function(kyc){
				if(kyc) {
					resolve(kyc);
				}else{
					reject("KYC not submitted yet");
				}
			}).catch(function(err){
				console.log(err);
				reject("Something went wrong");
			})
		});
	},

	submitKYC: (data) => {
		return new bluebird.Promise(function(resolve, reject){
			UserKYC.findOne({user_id: data.user_id}).then(function(kyc){
				if( kyc ) {
					// update
					// @todo: work on KYC update
					reject("KYC request already submitted");
				}else{
					// insert
					UserKYC(data).save().then(function(kyc){
						if(kyc){
							resolve("KYC request submitted. We will some process it and update");
						}else{
							reject("Failed to submit KYC request");	
						}
					}).catch(function(err){
						console.log(err);
						reject("Failed to submit KYC request");
					});
				}
			}).catch(function(err){
				console.log(err);
				reject("Something went wrong!");
			});
		});
	}

};