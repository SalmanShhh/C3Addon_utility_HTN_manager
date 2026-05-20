export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Task that got interrupted. Use case: stop old animations cleanly before new behavior starts.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastInterruptedTask;
}