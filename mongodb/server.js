const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Joi = require("joi");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://dylanlesesne:dylan2004@cluster0.e83rkbt.mongodb.net/?appName=Cluster0")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

const buildSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  price: { type: String, default: "" },
  cpu: String,
  gpu: String,
  ram: String,
  motherboard: String,
  storage: String,
  power_supply: String,
  description: { type: String, default: "" },
  img_name: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const Build = mongoose.model("Build", buildSchema);

const buildSchemaJoi = Joi.object({
  title: Joi.string().allow("").max(100),
  price: Joi.string().allow("").max(50),
  cpu: Joi.string().allow("").max(100),
  gpu: Joi.string().allow("").max(100),
  ram: Joi.string().allow("").max(50),
  storage: Joi.string().allow("").max(100),
  motherboard: Joi.string().allow("").max(100),
  power_supply: Joi.string().allow("").max(100),
  description: Joi.string().allow("").max(1000),
  img_name: Joi.string().allow("").max(200)
});

app.get("/api/userbuilds", async (req, res) => {
  try {
    const builds = await Build.find().sort({ createdAt: -1 });
    res.json(builds);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/userbuilds", async (req, res) => {
  const { error, value } = buildSchemaJoi.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: error.details.map((d) => ({ message: d.message, path: d.path }))
    });
  }

  try {
    const newBuild = new Build(value);
    const saved = await newBuild.save();
    res.status(201).json({ success: true, build: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error" });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
