const db = require("../models");

const getLoggedInProfile = async (req, res) => {
  console.log(req.user);
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).send({ message: "User ID not provided" });
    }

    const user = await db.User.findOne({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ message: "Get profile success", data: user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Fatal error on server", error });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { bio, email, username } = req.body;

  try {
    const userData = await db.User.findOne({ where: { id: userId } });
    if (bio) {
      userData.bio = bio;
    }
    if (email) {
      userData.email = email;
    }
    if (username) {
      userData.username = username;
    }
    await userData.save();

    res.send({
      message: "success update profile",
      data: userData,
    });
  } catch (error) {
    res.status(500).send({
      message: "fatal error on server",
      errors: error,
    });
  }
};

const getAdminAllProfile = async (req, res) => {
  const pagination = {
    page: Number(req.query.page) || 1,
    perPage: Number(req.query.perPage) || 4,
    search: req.query.search || undefined,
    sortBy: req.query.sortBy,
  };

  try {
    const where = {}; // generate where clause
    if (pagination.search) {
      where.username = {
        [db.Sequelize.Op.like]: `%${pagination.search}%`,
      };
    }
    const order = []; // generate order/sorting
    for (const sort in pagination.sortBy) {
      order.push([sort, pagination.sortBy[sort]]);
    }
    const user = await db.User.findAll({
      attributes: {
        exclude: ["password"],
      },
      where,
      // pagination
      limit: pagination.perPage,
      offset: (pagination.page - 1) * pagination.perPage,
      order,
    });

    const totalUser = await db.User.count({ where });
    res.send({
      message: "success get all profile",
      pagination: {
        ...pagination,
        totalData: totalUser,
      },
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      message: "fatal error on server",
      error,
    });
  }
};

module.exports = {
  getLoggedInProfile,
  getAdminAllProfile,
  updateProfile,
};
