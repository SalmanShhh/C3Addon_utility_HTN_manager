export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Planning: Invalidate Plan",
  displayText: "Invalidate plan for agent {0}",
  description: "Marks a plan as outdated for next update. Use case: world changed but current task should finish.",
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" }],
};

export const expose = true;

export default function (agentUID) {
  const agent = this._agents.get(Number(agentUID));
  if (agent) {
    agent.planStale = true;
  }
}