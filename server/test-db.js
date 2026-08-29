require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Failed");
    console.error(err.message);
  });