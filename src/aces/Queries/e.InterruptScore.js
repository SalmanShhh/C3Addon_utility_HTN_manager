export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Score that caused the last interruption. Use case: tune threshold to avoid over-reacting.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastInterruptScore;
}