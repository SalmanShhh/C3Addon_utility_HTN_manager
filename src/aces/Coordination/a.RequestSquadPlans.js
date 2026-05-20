export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Request Squad Plans",
  displayText: "Request plans for squad {0}",
  description: "Requests immediate planning for squad members. Use case: execute synced reaction now.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
  ],
};

export const expose = true;

export default function (squadId) {
  return this._requestSquadPlans(squadId);
}