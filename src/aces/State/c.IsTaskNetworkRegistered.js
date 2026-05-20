export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "Is Task Network Registered",
  displayText: "Is task network registered for {0}",
  description: "True when a task network is loaded for that type. Use case: verify setup before spawning agents.",
  isInvertible: true,
  params: [{ id: "agentType", name: "Agent Type", desc: "Agent type string.", type: "string", initialValue: '""' }],
};

export const expose = false;

export default function (agentType) {
  return this._taskNetworks.has(String(agentType ?? ""));
}