export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Numeric alert tier from trigger context. Use case: simple tier-based UI indicators.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastAlertTierIndex;
}