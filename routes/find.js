const findController = require("../controllers/find");
const express = require("express");
const app = express();
const router = express.Router();
const findInstance = new findController(app);
const requiresLogin = require("../helpers/auth").requiresLogin;

router.get("/", requiresLogin, findInstance.findUser);

module.exports = router;
