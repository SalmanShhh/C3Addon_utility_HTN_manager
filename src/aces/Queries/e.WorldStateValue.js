export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "any",
  description: "Reads one world-state value for an agent. Use case: display health or awareness in UI.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number" },
    { id: "key", name: "Key", desc: "World state key.", type: "string" },
  ],
};

export const expose = true;

export default function (agentUID, key) {
  return this._getWorldStateValue(agentUID, key);
}