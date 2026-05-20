export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "Is Agent Planning",
  displayText: "Is agent {0} planning",
  description: "True when an agent has work to do. Use case: branch events when an NPC is currently busy.",
  isInvertible: true,
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" }],
};

export const expose = false;

export default function (agentUID) {
  return !!this._agents.get(Number(agentUID))?.activeTask;
}