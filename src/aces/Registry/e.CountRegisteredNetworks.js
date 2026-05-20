export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "How many task networks are loaded. Use case: quick startup validation in debug builds.",
  params: [],
};

export const expose = true;

export default function () {
  return this._getCountRegisteredNetworks();
}