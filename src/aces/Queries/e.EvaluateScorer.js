export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Returns scorer value for an agent now. Use case: graph utility output while balancing AI.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number" },
    { id: "scorerId", name: "Scorer ID", desc: "Utility scorer identifier.", type: "string" },
  ],
};

export const expose = true;

export default function (agentUID, scorerId) {
  return this._evaluateScorer(agentUID, scorerId);
}