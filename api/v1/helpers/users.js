let crypto = require("crypto");
let config = require("../../../config");

module.exports = {
	createHash: (pass, salt) => {
		return crypto.createHmac(config.hash_algo, salt).update(pass).digest("hex");
	},

	createSalt: () => {
		return crypto.randomBytes(Math.ceil(config.salt_length/2)).toString('hex').slice(0, config.salt_length);
	},
};