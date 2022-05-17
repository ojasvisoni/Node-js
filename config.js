var env = process.env.NODE_ENV || 'development';

var config = {
	'development': {
		'port': process.env.PORT || '3001',
		'db': 'mongodb://localhost/sonigator-user-beta',
		'api': 'v1',
		'access_token': 'mHKy4opTxJzMxwir7LW5sTJDGom2dMXs',
		'jwtkey': '7D2241D43127EEA3E78F3CF736866',
		'salt_length': 16,
		'hash_algo': 'sha512',
		'special_token': 'specialtoken123'
	}
};

module.exports = config[env];