export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "Has World State Key",
  displayText: "Has agent {0} world state key {1}",
  description: "True if a world-state key exists. Use case: guard logic when optional data may be missing.",
  isInvertible: true,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" },
    { id: "key", name: "Key", desc: "World state key to check.", type: "string", initialValue: '""' },
  ],
};

export const expose = false;

export default function (agentUID, key) {
  const agent = this._agents.get(Number(agentUID));
  return !!agent && Object.prototype.hasOwnProperty.call(agent.worldState, String(key));
}