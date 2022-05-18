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

module.exports = router;