export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Performance: Process Planning Now",
  displayText: "Process planning now",
  description: "Runs one planning pass immediately. Use case: apply state changes now instead of waiting.",
  params: [],
};

export const expose = true;

export default function () {
  this._processPlanningNow();
}