export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Previous task ID before current one. Use case: detect when behavior transitions happen.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastPreviousTask;
}