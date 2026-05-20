export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Gets the squad ID for an agent. Use case: print squad tags in debug text.",
  params: [{ id: "agentUID", name: "Agent UID", desc: "Agent to query.", type: "number" }],
};

export const expose = true;

export default function (agentUID) {
  return this._getAgentSquad(agentUID);
}