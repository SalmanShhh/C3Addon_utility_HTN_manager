export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Alert: Add Alert Stimulus Extended",
  displayText: "Add extended alert stimulus to agent {0} using {1}",
  description: "Adds a detailed stimulus from JSON. Use case: set custom decay and update world state in one call.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" },
    { id: "stimulusJson", name: "Stimulus JSON", desc: "Stimulus payload JSON.", type: "string", initialValue: '"{}"' },
  ],
};

export const expose = true;

export default function (agentUID, stimulusJson) {
  return this._addStimulusExtended(agentUID, stimulusJson);
}