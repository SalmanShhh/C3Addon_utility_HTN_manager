export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Begin Task Network",
  displayText: "Begin task-network draft for agent type {0} with root task {1}",
  description: "Starts a clean task-network draft for one agent type.",
  params: [
    { id: "agentType", name: "Agent Type", desc: "Agent type key.", type: "string", initialValue: '"guard"' },
    { id: "rootTask", name: "Root Task", desc: "Top-level compound task name.", type: "string", initialValue: '"Root"' },
  ],
};

export const expose = true;

export default function (agentType, rootTask) {
  return this._beginTaskNetworkBuilder(agentType, rootTask);
}
