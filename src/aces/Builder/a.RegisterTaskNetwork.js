export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Register Task Network",
  displayText: "Register built task-network draft for agent type {0}",
  description: "Finalizes and registers the current task-network draft.",
  params: [
    { id: "agentType", name: "Agent Type", desc: "Agent type key.", type: "string", initialValue: '"guard"' },
  ],
};

export const expose = true;

export default function (agentType) {
  return this._registerBuiltTaskNetwork(agentType);
}
