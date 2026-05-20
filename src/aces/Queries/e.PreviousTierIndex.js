export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Previous alert tier index. Use case: detect if alert increased or decreased.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastPreviousTierIndex;
}