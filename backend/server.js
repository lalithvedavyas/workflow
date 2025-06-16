const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const cors = require('cors');

// Initialize app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());  // Allow cross-origin requests

// MongoDB setup
mongoose.connect('your-mongodb-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const Agent = require('./models/agent');
const Workflow = require('./models/workflow');

// Routes
app.post('/agents', async (req, res) => {
  const agent = new Agent(req.body);
  await agent.save();
  res.status(201).send(agent);
});

app.get('/agents', async (req, res) => {
  const agents = await Agent.find();
  res.status(200).send(agents);
});

app.post('/workflows', async (req, res) => {
  const workflow = new Workflow(req.body);
  await workflow.save();
  
  // Schedule workflow based on the time
  const scheduledTime = workflow.scheduleTime;
  cron.schedule(new Date(scheduledTime), () => {
    console.log(`Running workflow: ${workflow.name}`);
  });

  res.status(201).send(workflow);
});

app.get('/workflows', async (req, res) => {
  const workflows = await Workflow.find();
  res.status(200).send(workflows);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
