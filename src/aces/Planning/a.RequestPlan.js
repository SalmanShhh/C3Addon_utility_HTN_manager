export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Planning: Request Plan",
  displayText: "Request plan for agent {0}",
  description: "Builds a fresh plan right now. Use case: replan instantly after a major event.",
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" }],
};

export const expose = true;

export default function (agentUID) {
  return this._requestPlan(agentUID);
}