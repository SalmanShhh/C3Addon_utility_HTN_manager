export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Setup: Clear World State Key",
  displayText: "Clear world state {1} for agent {0}",
  description: "Removes one world-state key from an agent. Use case: clear last known target after search ends.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" },
    { id: "key", name: "Key", desc: "World state key to clear.", type: "string", initialValue: '""' },
  ],
};

export const expose = true;

export default function (agentUID, key) {
  return this._clearWorldStateKey(agentUID, key);
}