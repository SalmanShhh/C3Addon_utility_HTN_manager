export const config = {
  highlight: false,
  isDeprecated: false,
  listName: "Is Utility Scorer Registered",
  displayText: "Is utility scorer registered for {0}",
  description: "True when a scorer ID is available. Use case: validate data packs before combat starts.",
  isInvertible: true,
  params: [{ id: "scorerId", name: "Scorer ID", desc: "Utility scorer identifier.", type: "string", initialValue: '""' }],
};

export const expose = false;

export default function (scorerId) {
  return this._utilityScorers.has(String(scorerId ?? ""));
}