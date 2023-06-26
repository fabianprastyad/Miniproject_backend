const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

module.exports = {
  // authentication
  async verifyToken(req, res, next) {
    // check token valid or not
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).send({
        message: "token is not found",
      });
      return;
    }

    const [format, token] = authorization.split(" ");
    if (format.toLocaleLowerCase() === "bearer") {
      try {
        const payload = jwt.verify(token, secretKey);
        if (!payload) {
          res.status(401).send({
            message: "token verification failed",
          });
          return;
        }
        req.user = payload;
        next();
      } catch (error) {
        res.status(401).send({
          message: "invalid token",
          error,
        });
      }
    }
  },

  // authorization
  async verifyAdmin(req, res, next) {
    if (req.user.isAdmin) {
      return next();
    }
    res.status(401).send({
      message: "role is not allowed to access",
    });
  },
};
