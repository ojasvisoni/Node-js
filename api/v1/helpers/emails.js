let mailer = require("nodemailer");
let Templates = require("./../../../schemas/Templates");
let bluebird = require("bluebird");

const sender = "no-reply@sonigator.com";
const reply = "no-reply@sonigator.com";

var transporter = mailer.createTransport({
	host: "sg2plcpnl0092.prod.sin2.secureserver.net",
	post: 465,
	secure: true,
	auth: {
		user: "no-reply@sonigator.com",
		pass: "reply@123"
	}
});

var today = new Date().toLocaleString();

var mailBodies = {
	register:
	`<!DOCTYPE html><html><head><title>Sonigator-Emailer</title><link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></head><body style="padding-top: 5%; font-family: poppins;"> <div style="width: 70%; height: auto; margin: 0 auto; box-shadow: 0 0px 21px 3px rgba(0,0,0,.5);"> <p style="text-align: center; padding: 15px 0px; background-image: linear-gradient(90deg, #381768, #383fcf);"> <a href="#"><img src="/images/mailer/logo_default_dark.png" style="width: 23%;"></a> </p><div style="height: auto; background-image: url(/images/mailer/1.png); background-size: cover; margin-top: -13px; padding:30px 30px 40px 30px;"> <p style="font-size: 13px; color: #333;">Dear {{name}} Greetings !</p><p style="font-size: 13px; color: #333;">Thanks for the sign up. Your Sonigator account enables you to access all Sonigator portals with single login . To activate your account, please click on the following link:</p><p style="font-size: 13px; color: #333;"><a href="{{link}}">Confirm my registration</a></p><p style="font-size: 13px; color: #333;">Go to your dashboard, complete your profile. </p><p style="font-size: 13px; color: #333;"></p><p style="font-size: 13px; color: #333; padding-top: 20px;"><span>Best Regards,</span><br/>Team Sonigator<br/><a href="#">https://sonigator.com</a> </p></div></div></body></html>`,

	forgot_password:
	`<!DOCTYPE html><html><head><title>Sonigator-Emailer</title><link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></head><body style="padding-top: 5%; font-family: poppins;"> <div style="width: 70%; height: auto; margin: 0 auto; box-shadow: 0 0px 21px 3px rgba(0,0,0,.5);"> <p style="text-align: center; padding: 15px 0px; background-image: linear-gradient(90deg, #381768, #383fcf);"> <a href="#"><img src="/images/mailer/logo_default_dark.png" style="width: 23%;"></a> </p><div style="height: auto; background-image: url(/images/mailer/1.png); background-size: cover; margin-top: -13px; padding: 30px 30px 40px 30px;"> <p style="font-size: 13px; color: #333;">Dear {{name}} Greetings !</p><p style="font-size: 13px; color: #333;">Please click on the following link to regain access to your Sonigator account in case you forgot your password. If you clicked the "Forgot Password” link on the portal by mistake, you may discard and delete this Email.</p><p style="font-size: 13px; color: #333;"><a href="{{link}}">Reset my password.</a></p><p style="font-size: 13px; color: #333;">If needed, you may contact the Sonigator Support team through phone call, email or chat. </p><p style="font-size: 13px; color: #333; padding-top: 20px;"><span>Best Regards,</span><br/>Team Sonigator<br/><a href="#">https://sonigator.com</a> </p></div></div></body></html>`,

	login_notice: 
	`<!DOCTYPE html><html><head><title>Sonigator-Emailer</title><link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></head><body style="padding-top: 5%; font-family: poppins;"> <div style="width: 70%; height: auto; margin: 0 auto; box-shadow: 0 0px 21px 3px rgba(0,0,0,.5);"> <p style="text-align: center; padding: 15px 0px; background-image: linear-gradient(90deg, #381768, #383fcf);"> <a href="#"><img src="/images/mailer/logo_default_dark.png" style="width: 23%;"></a> </p><div style="height: auto; background-image: url(/images/mailer/1.png); background-size: cover; margin-top: -13px; padding: 30px 30px 40px 30px;"> <p style="font-size: 13px; color: #333;">Dear {{name}} Greetings !</p><p style="font-size: 13px; color: #333;">We recorded a login to your Sonigator account with the following details:</p><table> <tr> <td style="font-size: 13px; color: #333; padding-right: 70px;">Date/Time :</td><td style="font-size: 13px; color: #333; padding-right: 70px;">{{datetime}}</td></tr><tr> <td style="font-size: 13px; color: #333; padding-right: 70px;">IP Address : </td><td style="font-size: 13px; color: #333; padding-right: 70px;">{{ipaddress}}</td></tr><tr> <td style="font-size: 13px; color: #333; padding-right: 70px;">Browser :</td><td style="font-size: 13px; color: #333; padding-right: 70px;">{{browserinfo}}</td></tr></table> <p style="font-size: 13px; color: #333;">In case you notice any unauthorized login activity, immediately login to your Sonigator account, go to <span style="color: #3834b2;"> My Profile > Security tab and hit ‘Logout from all active devices’ </span>button.</p><p style="font-size: 13px; color: #333;">As a security measure, you can change your password and set up a two-factor authentication. If needed, you may contact the Sonigator Support team through phone call, email or chat. </p><p style="font-size: 13px; color: #333;"></p><p style="font-size: 13px; color: #333; padding-top: 20px;"><span>Best Regards,</span><br/>Team Sonigator<br/><a href="#">https://sonigator.com</a> </p></div></div></body></html>`,

	setup_2fa: 
	`<!DOCTYPE html><html><head><title>Sonigator-Emailer</title><link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></head><body style="padding-top: 5%; font-family: poppins;"> <div style="width: 70%; height: auto; margin: 0 auto; box-shadow: 0 0px 21px 3px rgba(0,0,0,.5);"> <p style="text-align: center; padding: 15px 0px; background-image: linear-gradient(90deg, #381768, #383fcf);"> <a href="#"><img src="/images/mailer/logo_default_dark.png" style="width: 23%;"></a> </p><div style="height: auto; background-image: url(/images/mailer/1.png); background-size: cover; margin-top: -13px; padding: 30px 30px 40px 30px;"> <p style="font-size: 13px; color: #333;">Dear {{name}} Greetings !</p><p style="font-size: 13px; color: #333;">We recorded an important activity into your Sonigator account. 2FA for Google Authenticator into your account has been setup or modification on date {{datetime}}. </p><p style="font-size: 13px; color: #333;">If this was not you, login into your account immediately, disable the Google Authenticator and set up a two-factor authentication again. If needed, you may contact the Sonigator Support team through phone call, Email or Chat. </p><p style="font-size: 13px; color: #333;"></p><p style="font-size: 13px; color: #333; padding-top: 20px;"><span>Best Regards,</span><br/>Team Sonigator<br/><a href="#">https://sonigator.com</a> </p></div></div></body></html>`,

	account_deactivated: 
	`<!DOCTYPE html><html><head><title>Sonigator-Emailer</title><link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"></head><body style="padding-top: 5%; font-family: poppins;"> <div style="width: 70%; height: auto; margin: 0 auto; box-shadow: 0 0px 21px 3px rgba(0,0,0,.5);"> <p style="text-align: center; padding: 15px 0px; background-image: linear-gradient(90deg, #381768, #383fcf);"> <a href="#"><img src="/images/mailer/logo_default_dark.png" style="width: 23%;"></a> </p><div style="height: auto; background-image: url(/images/mailer/1.png); background-size: cover; margin-top: -13px; padding: 30px 30px 40px 30px;"> <p style="font-size: 13px; color: #333;">Dear {{name}} Greetings !</p><p style="font-size: 13px; color: #333;">We recorded an important activity into your Sonigator account. Your account has been deactivated from the user side on date {{datetime}}.</p><p style="font-size: 13px; color: #333;">If this was not you, please contact the Sonigator Support team through phone call, Email or Chat. </p><p style="font-size: 13px; color: #333; padding-top: 20px;"><span>Best Regards,</span><br/>Team Sonigator<br/><a href="#">https://sonigator.com</a> </p></div></div></body></html>`
};

var parseBody = (body, data) => {
	for(var key in data) {
		body = body.replace('{{'+ key +'}}', data[key]);
	}
	return body;
};

const object = {
	initMail: (name, type, data) => {
		return new bluebird.Promise(function(resolve, reject) {
			var mailOptions = {
				from: `Sonigator<${sender}>`,
				replyTo: reply,
				to: data.to,
				subject: data.subject || 'Sonigator Mail',
				type: "html"
			};
			if(mailOptions.type == 'text')
				mailOptions.text = parseBody(mailBodies[name], data);
			else
				mailOptions.html = parseBody(mailBodies[name], data);

			transporter.sendMail(mailOptions, function(err, info){
				if(err){
					console.log(err);
					reject(err);
				}else{
					console.log("Mail Sent:", info.response, JSON.stringify(data));
					resolve(true);
				}
			});
		});
	}
};

module.exports = object;