export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Task ID at a plan index. Use case: preview next action for debugging UI.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number" },
    { id: "index", name: "Index", desc: "Plan index to read.", type: "number" },
  ],
};

export const expose = true;

export default function (agentUID, index) {
  return this._agents.get(Number(agentUID))?.plan[Number(index)] ?? "";
}