export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Named alert tier from trigger context. Use case: show readable debug text in HUD.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastAlertTierName;
}