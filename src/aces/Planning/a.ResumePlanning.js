export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Planning: Resume Planning",
  displayText: "Resume planning for agent {0}",
  description: "Restarts planning for one agent. Use case: resume AI after a stun or cutscene.",
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" }],
};

export const expose = true;

export default function (agentUID) {
  return this._resumePlanning(agentUID);
}