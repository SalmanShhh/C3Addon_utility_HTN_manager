export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Current started task ID. Use case: branch events by task name like patrol or chase.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastCurrentTask;
}