export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Compound task where planning failed. Use case: log broken network branches while testing.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastFailedCompoundTask;
}