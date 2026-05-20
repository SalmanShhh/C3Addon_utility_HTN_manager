export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Remaining task count in the plan. Use case: detect when agents are close to idle.",
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number" }],
};

export const expose = true;

export default function (agentUID) {
  return this._agents.get(Number(agentUID))?.plan.length ?? 0;
}