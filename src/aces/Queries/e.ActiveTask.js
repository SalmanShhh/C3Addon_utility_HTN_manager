export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Current active task for one agent. Use case: show simple behavior labels above NPCs.",
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number" }],
};

export const expose = true;

export default function (agentUID) {
  return this._getActiveTask(agentUID);
}