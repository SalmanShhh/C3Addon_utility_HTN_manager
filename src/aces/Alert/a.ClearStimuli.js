export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Alert: Clear Stimuli",
  displayText: "Clear stimuli for agent {0}",
  description: "Removes current stored stimuli. Use case: reset sensory pressure after a scripted state change.",
  params: [{ id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" }],
};

export const expose = true;

export default function (agentUID) {
  return this._clearStimuli(agentUID);
}