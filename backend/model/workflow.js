// backend/models/workflow.js
const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema({
  name: String,
  agents: Array,
  schedule: String,
});

module.exports = mongoose.model("Workflow", workflowSchema);
