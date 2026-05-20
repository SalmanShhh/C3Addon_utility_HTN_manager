export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Failed task ID from trigger context. Use case: retry or switch to a safer fallback action.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastFailedTask;
}