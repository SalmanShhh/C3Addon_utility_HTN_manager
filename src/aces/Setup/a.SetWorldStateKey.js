export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Setup: Set World State Key",
  displayText: "Set world state {1} for agent {0} to {2}",
  description: "Sets one value for one agent. Use case: update health or target visibility each tick.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" },
    { id: "key", name: "Key", desc: "World state key to set.", type: "string", initialValue: '""' },
    { id: "value", name: "Value", desc: "Value to store.", type: "any", initialValue: "0" },
  ],
};

export const expose = true;

export default function (agentUID, key, value) {
  return this._setWorldStateKey(agentUID, key, value);
}