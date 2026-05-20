export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Setup: Register Utility Scorer",
  displayText: "Register utility scorer from {0}",
  description: "Loads a utility scoring rule from JSON. Use case: tune attack vs retreat behavior by data.",
  params: [
    {
      id: "scorerJson",
      name: "Scorer JSON",
      desc: "Utility scorer definition as JSON.",
      type: "string",
      initialValue: '"{}"',
    },
  ],
};

export const expose = true;

export default function (scorerJson) {
  return this._registerUtilityScorer(scorerJson);
}