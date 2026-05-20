export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Add Method Subtask",
  displayText: "Add subtask {3} to method {2} on task {1} for agent type {0}",
  description: "Adds one subtask to a method in execution order.",
  params: [
    { id: "agentType", name: "Agent Type", desc: "Agent type key.", type: "string", initialValue: '"guard"' },
    { id: "taskName", name: "Task Name", desc: "Compound task name.", type: "string", initialValue: '"SelectBehavior"' },
    { id: "methodId", name: "Method ID", desc: "Method id to edit.", type: "string", initialValue: '"m_patrol"' },
    { id: "subtaskTaskName", name: "Subtask Task Name", desc: "Task name referenced by this method.", type: "string", initialValue: '"PatrolTask"' },
  ],
};

export const expose = true;

export default function (agentType, taskName, methodId, subtaskTaskName) {
  return this._addBuilderMethodSubtask(agentType, taskName, methodId, subtaskTaskName);
}
