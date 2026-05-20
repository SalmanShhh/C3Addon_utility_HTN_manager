export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Begin Utility Scorer",
  displayText: "Begin utility-scorer draft for scorer {0} with aggregation {1}",
  description: "Starts a clean utility-scorer draft.",
  params: [
    { id: "scorerId", name: "Scorer ID", desc: "Unique scorer id.", type: "string", initialValue: '"PatrolScore"' },
    {
      id: "aggregation",
      name: "Aggregation",
      desc: "How input values combine.",
      type: "combo",
      initialValue: "weighted_sum",
      items: [
        { weighted_sum: "Weighted sum" },
        { minimum: "Minimum" }
      ]
    }
  ],
};

export const expose = true;

export default function (scorerId, aggregation) {
  return this._beginUtilityScorerBuilder(scorerId, aggregation);
}
