let bluebird = require("bluebird");
let Transfers = require("./../../../schemas/Transactions");
let Withdrawal = require("./../../../schemas/Withdrawal");

module.exports = {
	getTransfers: (user_id, limit, offset) => {
		return new bluebird.Promise(function(resolve, reject){
			Transfers.find( {$and: [{from_user_id: user_id}, {to_user_id: user_id}]}, {}, {limit: limit, skip: offset} ).then(function(transactions) {
				if(transactions.length) {
					resolve(transactions);
				}else{
					reject("No more transactions");
				}
			}).catch(function(err){
				console.log(err);
				reject("Failed to get transactions");
			});
		});
	},

	addWithdrawal: (data, cb) => {
		Withdrawal(data).save().then(function(withdrawalReq){
			if(withdrawalReq){
				cb(null, withdrawalReq);
			}else{
				cb("Failed to save withdrawal request", null);	
			}
		}).catch(function(err){
			console.log(err);
			cb("Failed to save withdrawal request", null);
		});
	},

	deleteWithdrawal: (id, cb) => {
		Withdrawal.deleteOne({_id: id}).then(function(success){
			cb(null, true);
		}).catch(function(err){
			console.log(err);
			cb(true, null);
		});
	},

	verifyWithdrawal: (user_id, token) => {
		//console.log(user_id, token);
		return new bluebird.Promise(function(resolve, reject){
			Withdrawal.findOne({$and: [{user_id: user_id}, {token: token}]}).then(function(withdrawal){
				if(withdrawal){

					//withdrawal.token = null;
					withdrawal.status = 'processing';
					withdrawal.last_updated = new Date().getTime();

					withdrawal.save().then(function(saved){
						if(saved){
							resolve(true);
						}else{
							reject("Failed to update withdrawal status");
						}
					}).catch(function(err){
						console.log(err);
						reject("Failed to update withdrawal status");
					});

				}else{
					reject("Invalid token");
				}
			}).catch(function(err){
				console.log(err);
				reject("Invalid token");	
			});
		});
	},

	getWithdrawals: (user_id, limit, offset) => {
		return new bluebird.Promise(function(resolve, reject){
			Withdrawal.find( {user_id: user_id}, {}, {limit: limit, skip: offset} ).then(function(withdrawals) {
				if(withdrawals.length) {
					resolve(withdrawals);
				}else{
					reject("No more withdrawals");
				}
			}).catch(function(err){
				console.log(err);
				reject("Failed to get withdrawals");
			});
		});
	},

	getUserBalances: (user_id) => {
		return new bluebird.Promise(function(resolve, reject){
			Transfers.aggregate({
				$match: {$or: [{from_user_id: user_id, to_user_id: user_id}]},
				$group: {
					_id: "$coin_id",
					totalSent: {$sum: "$amount"}
				}
			}).then(function(result){
				console.log(result);
				resolve(result);
			}).catch(function(err){
				console.log(err);
				reject(false);
			});
		});
	},
};