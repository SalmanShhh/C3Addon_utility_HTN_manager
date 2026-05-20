export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Add Method",
  displayText: "Add method {2} on task {1} for agent type {0}",
  description: "Creates a method branch on a compound task.",
  params: [
    { id: "agentType", name: "Agent Type", desc: "Agent type key.", type: "string", initialValue: '"guard"' },
    { id: "taskName", name: "Task Name", desc: "Compound task name.", type: "string", initialValue: '"SelectBehavior"' },
    { id: "methodId", name: "Method ID", desc: "Unique method id within that task.", type: "string", initialValue: '"m_patrol"' },
  ],
};

export const expose = true;

export default function (agentType, taskName, methodId) {
  return this._addBuilderMethod(agentType, taskName, methodId);
}
