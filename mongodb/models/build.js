const mongoose = require("mongoose");

const buildSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  cpu: String,
  gpu: String,
  ram: String,
  storage: String,
  motherboard: String,
  power_supply: String,
  description: String,
  img_name: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Build", buildSchema);
