export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Alert: Decay Alert",
  displayText: "Decay alert for agent {0} by {1}",
  description: "Lowers alert by a fixed amount. Use case: calm an agent after the player escapes.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" },
    { id: "amount", name: "Amount", desc: "Amount to subtract.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (agentUID, amount) {
  return this._decayAlert(agentUID, amount);
}