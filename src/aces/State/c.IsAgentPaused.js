export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "Is Agent Paused",
  displayText: "Is agent {0} paused",
  description: "True when planning is paused for that agent. Use case: skip AI updates during scripted moments.",
  isInvertible: true,
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" }],
};

export const expose = false;

export default function (agentUID) {
  return !!this._agents.get(Number(agentUID))?.paused;
}