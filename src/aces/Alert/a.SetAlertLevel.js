export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Alert: Set Alert Level",
  displayText: "Set alert level for agent {0} to {1}",
  description: "Sets alert level directly from 0 to 1. Use case: force combat mode when player is spotted.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" },
    { id: "level", name: "Level", desc: "Alert level from 0 to 1.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (agentUID, level) {
  return this._setAlertLevel(agentUID, level);
}