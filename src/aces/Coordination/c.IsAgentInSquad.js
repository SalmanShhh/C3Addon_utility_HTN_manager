export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "Is Agent In Squad",
  displayText: "Is agent {0} in squad {1}",
  description: "Checks current squad membership. Use case: run squad-only logic per agent.",
  isInvertible: true,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Agent to test.", type: "number", initialValue: "0" },
    { id: "squadId", name: "Squad ID", desc: "Squad key string.", type: "string", initialValue: '"alpha"' },
  ],
};

export const expose = false;

export default function (agentUID, squadId) {
  return this._isAgentInSquad(agentUID, squadId);
}