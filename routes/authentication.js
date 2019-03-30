const authenticationController = require("../controllers/authentication");
const express = require("express");
const {alreadyLoggedIn, requiresLogin} = require("../helpers/auth");
const app = express();
const router = express.Router();
const authInstance = new authenticationController(app);

//login
router.get("/", alreadyLoggedIn,authInstance.getLogin)

router.get("/login", alreadyLoggedIn, authInstance.getLogin)

router.post("/login", alreadyLoggedIn, authInstance.login)

//register
router.get("/register",alreadyLoggedIn,  authInstance.getRegister)

router.post("/register", alreadyLoggedIn, authInstance.register)

//logout
router.get("/logout",requiresLogin,  authInstance.logout);

module.exports = router;
