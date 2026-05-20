export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Add Compound Task",
  displayText: "Add compound task {1} for agent type {0}",
  description: "Adds or ensures a compound task node in the current builder draft.",
  params: [
    { id: "agentType", name: "Agent Type", desc: "Agent type key.", type: "string", initialValue: '"guard"' },
    { id: "taskName", name: "Task Name", desc: "Compound task name.", type: "string", initialValue: '"SelectBehavior"' },
  ],
};

export const expose = true;

export default function (agentType, taskName) {
  return this._addBuilderCompoundTask(agentType, taskName);
}
