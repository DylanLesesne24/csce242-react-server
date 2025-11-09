const express = require("express");
const cors = require("cors");
const builds = require("./builds.json");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running");
});

app.get("/api/builds", (req, res) => {
  res.json(builds);
});

app.get("/api/builds/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = builds.find((b) => b._id === id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
