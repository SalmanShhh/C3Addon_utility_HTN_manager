export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Add Primitive Task",
  displayText: "Add primitive task {1} with runtime id {2} for agent type {0}",
  description: "Adds a primitive task that resolves to one runtime task id.",
  params: [
    { id: "agentType", name: "Agent Type", desc: "Agent type key.", type: "string", initialValue: '"guard"' },
    { id: "taskName", name: "Task Name", desc: "Task name used by methods.", type: "string", initialValue: '"PatrolTask"' },
    { id: "primitiveId", name: "Primitive ID", desc: "Task id output by the planner.", type: "string", initialValue: '"Patrol"' },
  ],
};

export const expose = true;

export default function (agentType, taskName, primitiveId) {
  return this._addBuilderPrimitiveTask(agentType, taskName, primitiveId);
}
