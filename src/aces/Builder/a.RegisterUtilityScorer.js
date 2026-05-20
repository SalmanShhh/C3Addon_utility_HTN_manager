export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Register Utility Scorer",
  displayText: "Register built utility-scorer draft for scorer {0}",
  description: "Finalizes and registers the current utility-scorer draft.",
  params: [
    { id: "scorerId", name: "Scorer ID", desc: "Scorer id to register.", type: "string", initialValue: '"PatrolScore"' },
  ],
};

export const expose = true;

export default function (scorerId) {
  return this._registerBuiltUtilityScorer(scorerId);
}
