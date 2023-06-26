const db = require("../models");
const {
  setFromFileNameToDBValue,
  getFilenameFromDbValue,
  getAbsolutePathPublicFile,
} = require("../utils/file");

const getAllBlog = async (req, res) => {
  try {
    const results = await db.Blog.findAll({
      include: [
        {
          model: db.User,
          attributes: ["username"],
        },
      ],
    });
    res.send({ message: "success get all blog", data: results });
  } catch (errors) {
    res.status(500).send({
      message: "fatal error on server",
      errors,
    });
  }
};

const deleteBlog = async (req, res) => {
  const blogId = req.body.id;
  try {
    const deletedBlog = await db.Blog.destroy({
      where: { id: blogId },
    });
    if (deletedBlog === 0) {
      return res.status(404).send({
        message: "Blog not found",
      });
    }
    res.send({
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Fatal error on server",
      error,
    });
  }
};

const getMyBlog = async (req, res) => {
  const userId = req.user.id;
  const pagination = {
    page: Number(req.query.page) || 1,
    perPage: Number(req.query.perPage) || 15,
    search: req.query.search || undefined,
  };
  try {
    const where = { userId };
    if (pagination.search) {
      where.content = {
        [db.Sequelize.Op.like]: `%${pagination.search}%`,
      };
    }
    const results = await db.Blog.findAll({
      where,
      limit: pagination.perPage,
      offset: (pagination.page - 1) * pagination.perPage,
    });

    const countData = await db.Blog.count({ where });
    pagination.totalData = countData;
    res.send({
      message: "success get Blog",
      pagination,
      data: results,
    });
  } catch (errors) {
    res.status(500).send({
      message: "fatal error on server",
      errors: errors.message,
    });
  }
};

const createBlog = async (req, res) => {
  const userId = req.user.id;
  const { content, Categories, country, keywords, title, vidioURL } = req.body;
  console.log(userId);

  const imageURL = setFromFileNameToDBValue(req.file.filename);
  try {
    const newBlog = await db.Blog.create({
      content: content,
      imageURL: imageURL,
      userId: userId,
      Categories: Categories,
      country: country,
      keywords: keywords,
      title: title,
      vidioURL: vidioURL,
    });
    res.status(201).send({
      message: "success create blog",
      data: newBlog,
    });
  } catch (errors) {
    console.log(errors);
    res.status(500).send({
      message: "fatal error on server",
      errors,
    });
  }
};

const likeBlog = async (req, res) => {
  const userId = req.user.id;
  const blogId = req.body.id;

  try {
    const blog = await db.Blog.findByPk(blogId);
    if (!blog) {
      return res.status(404).send({
        message: "Blog not found",
      });
    }

    // Cek apakah pengguna sudah menyukai blog sebelumnya
    const existingLike = await db.total_like.findOne({
      where: {
        userId: userId,
        blogId: blog.id,
      },
    });

    if (existingLike) {
      return res.status(400).send({
        message: "You have already liked this blog",
      });
    }

    // Tambahkan like baru ke database
    await db.total_like.create({
      userId: userId,
      blogId: blog.id,
    });

    // Tambahkan nilai total_like pada blog
    await blog.increment("total_like");

    res.send({
      message: "Blog liked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Fatal error on server",
      error,
    });
  }
};

module.exports = {
  createBlog,
  getAllBlog,
  deleteBlog,
  getMyBlog,
  likeBlog,
};
