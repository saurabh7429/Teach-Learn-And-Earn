const path = require('path');
const dns  = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
require("dotenv").config({ path: path.join(__dirname, '.env') });

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