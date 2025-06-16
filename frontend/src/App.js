import React, { useState, useEffect } from 'react';
import './App.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import axios from 'axios';

const App = () => {
  const [agents, setAgents] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [workflowConnections, setWorkflowConnections] = useState([]);
  const [scheduleTime, setScheduleTime] = useState("");

  useEffect(() => {
    fetchAgents();
    fetchWorkflows();
    
    flatpickr("#schedule-time", {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      minDate: "today",
      onChange: (selectedDates, dateStr, instance) => setScheduleTime(dateStr)
    });
  }, []);

  const fetchAgents = async () => {
    const response = await axios.get('/agents');
    setAgents(response.data);
  };

  const fetchWorkflows = async () => {
    const response = await axios.get('/workflows');
    setWorkflows(response.data);
  };

  const addAgentToCanvas = (agentName) => {
    const newAgent = { name: agentName, id: Date.now() };
    setWorkflowConnections([...workflowConnections, newAgent]);
  };

  const scheduleWorkflow = async () => {
    if (!scheduleTime || workflowConnections.length === 0) {
      alert("Please select a time and add agents to the workflow.");
      return;
    }

    const newWorkflow = {
      name: "New Workflow",
      agents: workflowConnections.map(agent => agent.name),
      scheduleTime: new Date(scheduleTime)
    };

    await axios.post('/workflows', newWorkflow);
    fetchWorkflows();
    alert("Workflow scheduled!");
  };

  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;

    const updatedConnections = Array.from(workflowConnections);
    const [removed] = updatedConnections.splice(source.index, 1);
    updatedConnections.splice(destination.index, 0, removed);
    setWorkflowConnections(updatedConnections);
  };

  return (
    <div className="App">
      <h1>Workflow Manager</h1>
      <div className="sidebar">
        <h3>Agents</h3>
        <ul>
          {agents.map(agent => (
            <li key={agent._id} onClick={() => addAgentToCanvas(agent.name)}>
              {agent.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="workflow-container">
        <h3>Workflow Canvas</h3>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                className="workflow-canvas"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {workflowConnections.map((agent, index) => (
                  <Draggable key={agent.id} draggableId={agent.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        className="agent"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {agent.name}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <input id="schedule-time" placeholder="Select schedule time" />
        <button onClick={scheduleWorkflow}>Schedule Workflow</button>
      </div>
      <div className="workflow-list">
        <h3>Scheduled Workflows</h3>
        <ul>
          {workflows.map(workflow => (
            <li key={workflow._id}>
              {workflow.name} - {new Date(workflow.scheduleTime).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
