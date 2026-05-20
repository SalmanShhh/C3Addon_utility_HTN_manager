export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Assign Agent To Squad",
  displayText: "Assign agent {0} to squad {1}",
  description: "Puts one agent in a squad. Use case: build patrol teams at layout start.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent to assign.", type: "number", initialValue: "0" },
    { id: "squadId", name: "Squad ID", desc: "Squad key string.", type: "string", initialValue: '"alpha"' },
  ],
};

export const expose = true;

export default function (agentUID, squadId) {
  return this._assignAgentToSquad(agentUID, squadId);
}