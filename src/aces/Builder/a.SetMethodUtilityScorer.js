export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Set Method Utility Scorer",
  displayText: "Set scorer {3} for method {2} on task {1} for agent type {0}",
  description: "Links a utility scorer to one method branch.",
  params: [
    { id: "agentType", name: "Agent Type", desc: "Agent type key.", type: "string", initialValue: '"guard"' },
    { id: "taskName", name: "Task Name", desc: "Compound task name.", type: "string", initialValue: '"SelectBehavior"' },
    { id: "methodId", name: "Method ID", desc: "Method id to edit.", type: "string", initialValue: '"m_patrol"' },
    { id: "scorerId", name: "Scorer ID", desc: "Registered utility scorer id.", type: "string", initialValue: '"PatrolScore"' },
  ],
};

export const expose = true;

export default function (agentType, taskName, methodId, scorerId) {
  return this._setBuilderMethodScorer(agentType, taskName, methodId, scorerId);
}
