# Node Js User Login and Registration Rest Api 
Function includes user registeration, login, dashboard, account updatation, Profile updation, email verifications, forget and reset password functionality

### For this project:
1. MongoDB database is used. 
2. MSG91 API(using curl) is used to send OTP to phone.
3. SMPT is used for email verification.
4. Language used: Javascript.

### REST API Structure:
api/v1 <br />
          -> controllers -> Control functions <br />
          -> helpers -> Global helper functions <br />
          -> middlewares -> Authentication, token generation and verification is done. 3 tokens are generated here: x-access-token for header, x-user-token for users and x-special-token for admins <br />
          -> models -> Database communication. All databse queries are set here <br />
          -> routes.js -> It directs incoming API requests to backend resources. Consist of an HTTP method and a resource path <br />

### Database schemas used:
Tempates.js for emails(uuid, name, type, subject, body) <br />
UserAccount.js for user registeration(2FA, Password reset, kyc, security, notification, verification) <br />
UserLogin.js for user login(uuid and timestamp) <br />
UserProfile.js for user Profile(uuid, user id, name, email, phone no., address, dob)
Thanks!
