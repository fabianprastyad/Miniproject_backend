const { blog: blogController } = require("../controllers");
const router = require("express").Router();
const { verifyToken } = require("../middleware/auth");
const multerUpload = require("../middleware/multer");

router.post(
  "/createBlog",
  verifyToken,
  multerUpload.single("file"),
  blogController.createBlog
);

router.get("/getAllBlog", blogController.getAllBlog);
router.delete("/deleteBlog", blogController.deleteBlog);

module.exports = router;
