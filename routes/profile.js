const router = require("express").Router();
const {
  profile: profileController,
  blog: blogController,
} = require("../controllers");
const authMiddleware = require("../middleware/auth");

router.use("/verifyToken", authMiddleware.verifyToken);
router.get(
  "/profile",
  authMiddleware.verifyToken,
  profileController.getLoggedInProfile
);
router.patch(
  "/updateProfile",
  authMiddleware.verifyToken,
  profileController.updateProfile
);
router.get("/blog", blogController.getMyBlog);

router.get(
  "/all",
  authMiddleware.verifyAdmin,
  profileController.getAdminAllProfile
);

module.exports = router;
