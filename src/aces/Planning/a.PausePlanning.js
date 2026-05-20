export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Planning: Pause Planning",
  displayText: "Pause planning for agent {0}",
  description: "Stops planning updates for one agent. Use case: freeze NPC AI while a dialogue plays.",
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" }],
};

export const expose = true;

export default function (agentUID) {
  return this._pausePlanning(agentUID);
}