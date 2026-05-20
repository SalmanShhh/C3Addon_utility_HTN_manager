export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Alert level value from trigger context. Use case: drive bar fill in a stealth meter.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastAlertLevel;
}