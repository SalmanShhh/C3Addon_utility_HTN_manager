export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Invalidate Squad Plans",
  displayText: "Invalidate plans for squad {0}",
  description: "Marks squad members stale for next planning update. Use case: tactic changed for full squad.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
  ],
};

export const expose = true;

export default function (squadId) {
  return this._invalidateSquadPlans(squadId);
}