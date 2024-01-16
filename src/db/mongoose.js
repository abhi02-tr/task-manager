const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL, {})
  .then((res) => {
    console.log("connected..");
  })
  .catch((err) => console.log(err));
