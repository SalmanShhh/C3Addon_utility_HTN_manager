export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Debug: Dump Agent State",
  displayText: "Dump agent state for agent {0}",
  description: "Prints one agent snapshot in the console. Use case: quickly check world state and current plan.",
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" }],
};

export const expose = true;

export default function (agentUID) {
  return this._dumpAgentState(agentUID);
}