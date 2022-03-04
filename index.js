require("dotenv").config();
const express = require("express");
const app = express();
const port = 5000;
const routes = require("./routes");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);

app.listen(port, () => {
  console.log("app is running at port", port);
});
