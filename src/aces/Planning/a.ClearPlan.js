export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Planning: Clear Plan",
  displayText: "Clear plan for agent {0}",
  description: "Removes remaining planned tasks. Use case: keep an agent idle until new orders arrive.",
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" }],
};

export const expose = true;

export default function (agentUID) {
  return this._clearPlan(agentUID);
}