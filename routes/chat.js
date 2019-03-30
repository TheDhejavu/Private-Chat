const chatController = require("../controllers/chat");
const express = require("express");
const app = express();
const router = express.Router();
const chatInstance = new chatController(app);
const requiresLogin = require("../helpers/auth").requiresLogin;

router.get("/", requiresLogin,chatInstance.redirectChat);

router.get("/:nickname", requiresLogin, chatInstance.checkUserExist);

router.get("/:nickname/:uniqueId", requiresLogin, chatInstance.getMessages);

router.post("/", requiresLogin,chatInstance.saveAndRetrieveMessage);

module.exports = router;
