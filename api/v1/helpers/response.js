const status = require('http-status-codes');

module.exports = {
	sendNotFound: (r, m, d) => {
		console.log("Response: ", {status: false, message: m, data: JSON.stringify(d)});
		r.status(status.NOT_FOUND).send({status: false, message: m, data: d});
	},

	sendFail: (r, m, d) => {
		console.log("Response: ", {status: false, message: m, data: JSON.stringify(d)});
		r.status(status.FORBIDDEN).send({status: false, message: m, data: d});
	},

	sendSuccess: (r, m, d) => {
		console.log("Response: ", {status: true, message: m, data: JSON.stringify(d)});
		r.status(status.OK).send({status: true, message: m, data: d});
	}
};