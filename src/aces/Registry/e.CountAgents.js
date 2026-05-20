export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Current registered agent count. Use case: monitor AI population for performance tuning.",
  params: [],
};

export const expose = true;

export default function () {
  return this._getCountAgents();
}