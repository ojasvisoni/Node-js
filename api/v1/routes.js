let express = require('express');
var router = express.Router();
var accountController = require("./controllers/Account");


router.get("/send_email", accountController.sendEmail);

var auth = require("./middlewares/auth");

router.get("/set_profile", accountController.setProfile);
router.use(auth.header);

// routes before login
router.put("/verify_email/:token", accountController.verify_email);
router.post("/register", accountController.register);
router.post("/login", accountController.login);
router.post("/login_with_2fa", accountController.login_with_2fa);
router.post("/send_otp", accountController.send_otp);
router.post("/forgot_password", accountController.forgot_password);

module.exports = router;