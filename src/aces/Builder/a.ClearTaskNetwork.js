export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Clear Task Network Draft",
  displayText: "Clear task-network draft for agent type {0}",
  description: "Removes the in-progress task-network draft for one agent type.",
  params: [
    { id: "agentType", name: "Agent Type", desc: "Agent type key.", type: "string", initialValue: '"guard"' },
  ],
};

export const expose = true;

export default function (agentType) {
  return this._clearTaskNetworkBuilder(agentType);
}
