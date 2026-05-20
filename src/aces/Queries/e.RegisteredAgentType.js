export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Last registered agent type key. Use case: verify setup order in startup events.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastRegisteredAgentType;
}