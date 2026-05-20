export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Planning: Force Task",
  displayText: "Force task {1} for agent {0}",
  description: "Forces one task to run first. Use case: trigger a scripted reaction during a cutscene.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" },
    { id: "taskId", name: "Task ID", desc: "Primitive task ID to force.", type: "string", initialValue: '""' },
  ],
};

export const expose = true;

export default function (agentUID, taskId) {
  return this._forceTask(agentUID, taskId);
}