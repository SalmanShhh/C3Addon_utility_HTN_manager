export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Clear Utility Scorer Draft",
  displayText: "Clear utility-scorer draft for scorer {0}",
  description: "Removes the in-progress utility-scorer draft.",
  params: [
    { id: "scorerId", name: "Scorer ID", desc: "Scorer id to clear.", type: "string", initialValue: '"PatrolScore"' },
  ],
};

export const expose = true;

export default function (scorerId) {
  return this._clearUtilityScorerBuilder(scorerId);
}
