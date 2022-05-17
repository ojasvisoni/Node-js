let express = require('express');
var router = express.Router();
var accountController = require("./controllers/Account");


router.get("/send_email", accountController.sendEmail);

var auth = require("./middlewares/auth");
router.get("/set_profile", accountController.setProfile);

module.exports = router;