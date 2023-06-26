const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const hbs = require("handlebars");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const transporter = require("../helpers/transporter");

const { User } = require("../models");

const db = require("../models");
// const transporter = require("transporter");

const register = async (req, res) => {
  const { username, email, phoneNumber, password } = req.body;
  console.log(username);
  try {
    // TODO: move this validation to middleware
    const isExist = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }, { phoneNumber }],
      },
    });

    if (isExist) {
      res.status(400).send({
        message: "username/email/phone number already registered",
      });
      return;
    }

    // generate random verification
    const verifyToken = crypto.randomBytes(16).toString("hex");
    const time = new Date();

    // generate password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      phoneNumber,
      password: hashPassword,
      verifyToken,
      verifyTokenCreatedAt: time,
    });

    // authorization that send to email
    const link = `${process.env.FE_BASEPATH}/verify/${verifyToken}`;
    const template = fs.readFileSync("./templates/register.html", "utf-8");
    const templateCompile = hbs.compile(template);
    const htmlResult = templateCompile({ username, link });

    await transporter.sendMail({
      from: "web blog",
      to: email,
      subject: "Thanks for your registration",
      html: htmlResult,
    });

    res.status(201).send({
      message: "registration success",
      data: {
        username: newUser.username,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "something went wrong on the server",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { user_identification, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { email: user_identification },
          { phoneNumber: user_identification },
          { username: user_identification },
        ],
      },
    });
    if (!user) {
      return res.status(400).send({
        message: "login failed, incorrect identity/password",
      });
    }

    // check password match with hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      user.loginTrialCount++;
      if (user.loginTrialCount >= 3) {
        user.isSuspended = true;
      }
      await user.save();
      return res.status(400).send({
        message: "inccorect password",
      });
    }

    // reset counter login
    user.loginTrialCount = 0;
    await user.save();
    // generate token authorization
    const payload = { id: user.id, isAdmin: user.isAdmin };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.send({
      message: "login success",
      data: user,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).send({
      message: "fatal error on the server",
      error: error.message,
    });
  }
};

const verify = async (req, res) => {
  const token = req.body.verifyToken;
  try {
    const userData = await db.User.findOne({
      where: {
        verifyToken: token,
      },
    });
    if (!userData) {
      return res.status(400).send({
        message: "verification token is invalid",
      });
    }
    if (userData.isVerified) {
      return res.status(400).send({
        message: "user already verified",
      });
    }
    // check if verify token expired or not.
    const createdAt = new Date(userData.verifyTokenCreatedAt);
    const now = new Date();
    // set createdAt to next 1 hour
    createdAt.setHours(createdAt.getHours() + 1);
    if (now > createdAt) {
      return res.status(400).send({
        message: "verify token has expired",
      });
    }

    // save to db
    userData.isVerified = true;
    userData.verifyToken = null;
    userData.verifyTokenCreatedAt = null;
    await userData.save();

    res.send({
      message: "verification process is successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "fatal error on the server",
      error: error.message,
    });
  }
};

const resend = async (req, res) => {
  const { email } = req.body;
  try {
    const userData = await db.User.findOne({ where: { email } });
    if (!userData) {
      return res.status(400).send({
        message: "account not found",
      });
    }
    if (userData.isVerified) {
      return res.status(400).send({
        message: "account already verified",
      });
    }

    // generate random verification
    const verifyToken = crypto.randomBytes(16).toString("hex");
    const time = new Date();

    const username = userData.username;
    userData.verifyToken = verifyToken;
    userData.verifyTokenCreatedAt = time;
    await userData.save();

    // render template html email
    const link = `${process.env.FE_BASEPATH}/verify/${verifyToken}`;
    const template = fs.readFileSync("./templates/register.html", "utf-8");
    const templateCompile = hbs.compile(template);
    const htmlResult = templateCompile({ username, link });
    // send email
    await transporter.sendMail({
      from: "SociaApp - Your true social fren",
      to: email,
      subject: "Sociaapp - Thanks for your registration",
      html: htmlResult,
    });

    res.send({
      message: "email has been sent, please check your email",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "fatal error on the server",
      error: error.message,
    });
  }
};

const forgot = async (req, res) => {
  const { email } = req.body;

  try {
    const userData = await db.User.findOne({ where: { email } });
    if (!userData) {
      return res.status(500).send({
        message: "user not found",
      });
    }

    // generate forgot token
    const forgotToken = crypto.randomBytes(16).toString("hex");
    const username = userData.username;
    const time = new Date();

    // render template html email
    const link = `${process.env.FE_BASEPATH}/reset-pass/${forgotToken}`;
    const template = fs.readFileSync("./templates/forgot.html", "utf-8");
    const templateCompile = hbs.compile(template);
    const htmlResult = templateCompile({ username, link });
    // send email
    await transporter.sendMail({
      from: "web blog",
      to: email,
      subject: "web blog - Reset Password",
      html: htmlResult,
    });

    // save token to db
    userData.forgotToken = forgotToken;
    userData.forgotTokenCreatedAt = time;
    await userData.save();

    res.send({
      message: "password reset success, check your email!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "fatal error on the server",
      error: error.message,
    });
  }
};

const reset = async (req, res) => {
  const { token, password } = req.body;
  try {
    const userData = await db.User.findOne({
      where: {
        forgotToken: token,
      },
    });
    if (!userData) {
      return res.status(400).send({ message: "token is not valid" });
    }

    // check token expiration
    const tokenCA = new Date(userData.forgotTokenCreatedAt);
    const now = new Date();
    tokenCA.setHours(tokenCA.getHours() + 1);

    if (now > tokenCA) {
      return res.status(400).send({
        message: "token has already expired",
      });
    }

    // generate password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    userData.password = hashPassword;
    userData.isSuspended = false;
    userData.loginTrialCount = 0;
    userData.forgotToken = null;
    userData.forgotTokenCreatedAt = null;
    await userData.save();
    res.send({
      message: "password has been reset, try to login now!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "fatal error on the server",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  verify,
  resend,
  forgot,
  reset,
};
