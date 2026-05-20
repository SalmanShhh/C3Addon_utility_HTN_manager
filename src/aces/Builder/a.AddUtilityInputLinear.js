export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Builder: Add Utility Input (Linear)",
  displayText: "Add utility input key {1} weight {2} invert {3} points ({4},{5}) to ({6},{7}) for scorer {0}",
  description: "Adds one scorer input with a 2-point curve.",
  params: [
    { id: "scorerId", name: "Scorer ID", desc: "Scorer id to edit.", type: "string", initialValue: '"PatrolScore"' },
    { id: "worldStateKey", name: "World State Key", desc: "Input key read from state.", type: "string", initialValue: '"needsPatrol"' },
    { id: "weight", name: "Weight", desc: "Input contribution multiplier.", type: "number", initialValue: "1" },
    {
      id: "invert",
      name: "Invert",
      desc: "Flip the curve output.",
      type: "combo",
      initialValue: "0",
      items: [
        { "0": "No" },
        { "1": "Yes" }
      ]
    },
    { id: "x1", name: "Point 1 X", desc: "Curve point 1 x-value.", type: "number", initialValue: "0" },
    { id: "y1", name: "Point 1 Y", desc: "Curve point 1 y-value.", type: "number", initialValue: "0" },
    { id: "x2", name: "Point 2 X", desc: "Curve point 2 x-value.", type: "number", initialValue: "1" },
    { id: "y2", name: "Point 2 Y", desc: "Curve point 2 y-value.", type: "number", initialValue: "1" },
  ],
};

export const expose = true;

export default function (scorerId, worldStateKey, weight, invert, x1, y1, x2, y2) {
  return this._addUtilityScorerInput(scorerId, worldStateKey, weight, invert, x1, y1, x2, y2);
}
