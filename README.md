# Node Js User Login and Registration Rest Api 

### For this project:
1. MongoDB database is used. 
2. MSG91 API is used to send OTP to phone.

### REST API Structure:
api -> v1 -> controllers -> Control functions
          -> helpers -> Global helper functions
          -> middlewares -> Authentication, token generation and verification is done. 3 tokens are generated here: x-access-token for header, x-user-token for users and x-special-token for admins
          -> models -> Database communication. All databse queries are set here
          -> routes.js -> It directs incoming API requests to backend resources. Consist of an HTTP method and a resource path

