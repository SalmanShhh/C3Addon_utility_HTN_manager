export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "How many utility scorers are loaded. Use case: confirm balance data loaded correctly.",
  params: [],
};

export const expose = true;

export default function () {
  return this._getCountRegisteredScorers();
}