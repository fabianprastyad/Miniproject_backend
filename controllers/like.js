const db = require("../models");

const likeBlog = async (req, res) => {
  const blogID = req.params.id;
  const userID = req.user.id;
  try {
    const userData = await db.User.findOne({
      where: { id: userID },
    });
    //check if user verified
    if (!userData.isVerified) {
      return res.status(400).send({
        message: "user is not verified",
      });
    }
    //check if blog exist
    const isExist = await db.Blog.findOne({
      where: { id: blogID },
    });
    if (!isExist) {
      return res.status(404).send({
        message: "blog not found",
      });
    }

    //check duplicate
    const isLiked = await db.Like.findOne({
      where: { [db.Sequelize.Op.and]: [{ userID }, { blogID }] },
    });
    if (isLiked) {
      return res.status(400).send({
        message: "you've already liked this blog",
      });
    }
    const likeData = await db.Like.create({
      userID,
      blogID,
    });
    res.status(200).send({
      message: "like success",
      likeData,
    });
  } catch (error) {
    res.status(500).send({
      message: "fatal error on server",
      errors: error.message,
    });
  }
};

module.exports = {
  likeBlog,
};
