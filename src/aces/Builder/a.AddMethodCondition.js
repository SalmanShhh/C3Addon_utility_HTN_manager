export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Add Method Condition",
  displayText: "Add condition {3} {4} {5} to method {2} on task {1} for agent type {0}",
  description: "Adds one world-state condition gate to a method.",
  params: [
    { id: "agentType", name: "Agent Type", desc: "Agent type key.", type: "string", initialValue: '"guard"' },
    { id: "taskName", name: "Task Name", desc: "Compound task name.", type: "string", initialValue: '"SelectBehavior"' },
    { id: "methodId", name: "Method ID", desc: "Method id to edit.", type: "string", initialValue: '"m_patrol"' },
    { id: "key", name: "State Key", desc: "World/global state key.", type: "string", initialValue: '"enemyVisible"' },
    {
      id: "op",
      name: "Operator",
      desc: "Comparison operator.",
      type: "combo",
      initialValue: "eq",
      items: [
        { eq: "== (Equal)" },
        { neq: "!= (Not equal)" },
        { gt: "> (Greater than)" },
        { gte: ">= (Greater or equal)" },
        { lt: "< (Less than)" },
        { lte: "<= (Less or equal)" }
      ]
    },
    { id: "value", name: "Value", desc: "Value to compare against.", type: "any", initialValue: "1" },
  ],
};

export const expose = true;

export default function (agentType, taskName, methodId, key, op, value) {
  return this._addBuilderMethodCondition(agentType, taskName, methodId, key, op, value);
}
