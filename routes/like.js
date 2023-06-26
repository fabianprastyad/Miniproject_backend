const { like: likeController } = require("../controllers");
const router = require("express").Router();
const authMiddleware = require("../middleware/auth");

router.post("/like/:id", authMiddleware.verifyToken, likeController.likeBlog);

module.exports = router;
