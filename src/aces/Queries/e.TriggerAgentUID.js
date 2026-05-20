export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Agent UID from the latest trigger. Use case: pick the exact instance to move or animate.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastTriggerAgentUID;
}