export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Number of primitive tasks for one type. Use case: verify network content during setup.",
  params: [{ id: "agentType", name: "Agent Type", desc: "Agent type string.", type: "string" }],
};

export const expose = true;

export default function (agentType) {
  return this._getCountRegisteredTasks(agentType);
}