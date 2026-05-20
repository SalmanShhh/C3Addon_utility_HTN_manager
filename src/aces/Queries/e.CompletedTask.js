export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Completed task ID from trigger context. Use case: reward points for finished objective tasks.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastCompletedTask;
}