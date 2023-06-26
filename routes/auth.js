const { auth: authController } = require("../controllers");
const router = require("express").Router();

// register
router.post("/register", authController.register);

//login
router.post("/login", authController.login);

// verify account
router.patch("/verify", authController.verify);

//forget password
router.post("/forgotpass", authController.forgot);

//reset password
router.post("/reset", authController.reset);
module.exports = router;

//resend verif Token
router.post("/resend", authController.resend);
