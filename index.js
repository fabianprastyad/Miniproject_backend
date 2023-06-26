require("dotenv").config({ path: ".env" });
const express = require("express");
const app = express();
const PORT = 8000;
const routes = require("./routes");
const db = require("./models");
const sequelize = require("sequelize");
app.use(express.json());

app.use("/static", express.static("Public"));

app.use("/auth", routes.auth);
app.use("/blog", routes.blog);
app.use("/profile", routes.profile);
app.use("/like", routes.like);

db.sequelize
  .authenticate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`app start on localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("failed to connect DB");
    console.error(error);
  });
