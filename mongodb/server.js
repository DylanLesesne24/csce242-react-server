const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Joi = require("joi");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const PUBLIC_DIR = path.join(__dirname, "..", "public");
if (fs.existsSync(PUBLIC_DIR)) app.use(express.static(PUBLIC_DIR));

const builds = [
  { _id: 1, title: "Intel Gaming Build", price: "$1300", cpu: "Intel Core i5-12400F", gpu: "NVIDIA RTX 3060", ram: "16GB DDR4", storage: "512GB NVMe SSD", motherboard: "ATX B660", description: "Solid midrange gaming PC for 1080p/1440p gaming.", img_name: "images/intelpc.jpg" },
  { _id: 2, title: "Ryzen Performance Build", price: "$1450", cpu: "AMD Ryzen 5 5600X", gpu: "NVIDIA RTX 3070", ram: "16GB DDR4", storage: "1TB NVMe SSD", motherboard: "Micro-ATX B550", description: "Great balance of CPU and GPU for gaming and streaming.", img_name: "images/ryzenpc.jpg" },
  { _id: 3, title: "Budget Starter Build", price: "$600", cpu: "Intel Core i3 / Ryzen 3", gpu: "Integrated or GTX 1650", ram: "8GB DDR4", storage: "500GB SSD", motherboard: "Micro-ATX", description: "Entry-level PC for schoolwork, light gaming, and everyday use.", img_name: "images/budget-build.jpg" },
  { _id: 4, title: "Content Creator Workstation", price: "$2200", cpu: "AMD Ryzen 9 5900X", gpu: "NVIDIA RTX 3080", ram: "32GB DDR4", storage: "2TB NVMe + 4TB HDD", motherboard: "ATX X570", description: "Designed for video editing, rendering, and multitasking.", img_name: "images/content-creator.jpg" },
  { _id: 5, title: "Mini ITX Compact Build", price: "$1000", cpu: "Intel Core i5", gpu: "NVIDIA RTX 3060 (mini)", ram: "16GB DDR4", storage: "1TB NVMe SSD", motherboard: "Mini-ITX", description: "Small form-factor PC with good performance for tight spaces.", img_name: "images/mini-itx.jpg" },
  { _id: 6, title: "VR Ready Build", price: "$1700", cpu: "Intel Core i7", gpu: "NVIDIA RTX 3070", ram: "16GB DDR4", storage: "1TB NVMe SSD", motherboard: "ATX Z590", description: "Optimized for VR gaming and smooth framerates.", img_name: "images/vr-ready.jpg" },
  { _id: 7, title: "Streaming & Gaming Build", price: "$1600", cpu: "AMD Ryzen 7", gpu: "NVIDIA RTX 3060 Ti", ram: "32GB DDR4", storage: "1TB NVMe SSD", motherboard: "ATX B550", description: "Better multitasking for streaming while gaming.", img_name: "images/streaming-build.jpg" },
  { _id: 8, title: "High-End Enthusiast Build", price: "$3200", cpu: "Intel Core i9 / AMD Threadripper", gpu: "NVIDIA RTX 4090", ram: "64GB DDR5", storage: "2x 2TB NVMe", motherboard: "ATX X670 / TRX40", description: "Top-tier components for ultra settings, 4K and heavy workloads.", img_name: "images/high-end.jpg" }
];

app.get("/api", (req, res) => {
  res.json({
    message: "Builds API",
    endpoints: [
      { method: "GET", path: "/api", description: "API overview" },
      { method: "GET", path: "/api/builds", description: "List all builds (static)" },
      { method: "GET", path: "/api/builds/:id", description: "Get a single static build by id or title" },
      { method: "GET", path: "/api/userbuilds", description: "List user-created builds (MongoDB)" },
      { method: "POST", path: "/api/userbuilds", description: "Create a new user build (MongoDB)" }
    ]
  });
});

app.get("/api/builds", (req, res) => {
  res.json(builds);
});

app.get("/api/builds/:id", (req, res) => {
  const raw = req.params.id;
  const idNum = Number(raw);
  let found = null;
  if (!Number.isNaN(idNum)) found = builds.find((b) => b._id === idNum || String(b._id) === String(idNum));
  if (!found) found = builds.find((b) => String(b._id) === String(raw) || String(b.title) === String(raw));
  if (!found) return res.status(404).json({ error: "Build not found" });
  res.json(found);
});

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
    const builds = await Build.find().sort({ createdAt: -1 }).lean();
    res.json(builds);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/userbuilds/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const build = mongoose.isValidObjectId(id)
      ? await Build.findById(id).lean()
      : await Build.findOne({ title: id }).lean();
    if (!build) return res.status(404).json({ error: "Not found" });
    res.json(build);
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

if (app && app._router) {
  console.log("Registered routes:");
  app._router.stack
    .filter(r => r.route && r.route.path)
    .forEach(r => {
      const methods = Object.keys(r.route.methods).join(", ").toUpperCase();
      console.log(`${methods} ${r.route.path}`);
    });
} else {
  console.log("No router found to list routes");
}

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
