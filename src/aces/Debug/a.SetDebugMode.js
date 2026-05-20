export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Debug: Set Debug Mode",
  displayText: "Set debug mode to {0}",
  description: "Turns debug logging on or off. Use case: inspect planner decisions while testing.",
  params: [{ id: "enabled", name: "Enabled", desc: "True to enable debug logging.", type: "boolean", initialValue: "false" }],
};

export const expose = true;

export default function (enabled) {
  return this._setDebugMode(enabled);
}