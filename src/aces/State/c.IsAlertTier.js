export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "Is Alert Tier",
  displayText: "Is agent {0} in alert tier {1}",
  description: "Checks the current alert tier name. Use case: run different events for suspicious vs combat.",
  isInvertible: true,
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" },
    {
      id: "tier",
      name: "Tier",
      desc: "Alert tier name.",
      type: "combo",
      initialValue: "unaware",
      items: [
        { unaware: "Unaware" },
        { suspicious: "Suspicious" },
        { alerted: "Alerted" },
        { combat: "Combat" },
      ],
    },
  ],
};

export const expose = false;

export default function (agentUID, tier) {
  return this._getAlertTierName(agentUID) === String(tier ?? "");
}