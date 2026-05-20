export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Gets primitive task ID by index. Use case: print all registered tasks to a debug panel.",
  params: [
    { id: "agentType", name: "Agent Type", desc: "Agent type string.", type: "string" },
    { id: "index", name: "Index", desc: "Zero-based task index.", type: "number" },
  ],
};

export const expose = true;

export default function (agentType, index) {
  return this._getRegisteredTaskByIndex(agentType, index);
}