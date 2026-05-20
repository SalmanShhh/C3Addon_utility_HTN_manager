export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Alert: Add Alert Stimulus",
  displayText: "Add {1} stimulus to agent {0} with intensity {2} at {3}, {4}",
  description: "Adds a simple stimulus event. Use case: raise alert when a guard hears a noise.",
  params: [
    { id: "agentUID", name: "Agent UID", desc: "Target agent UID.", type: "number", initialValue: "0" },
    { id: "stimulusType", name: "Type", desc: "Stimulus type string.", type: "string", initialValue: '""' },
    { id: "intensity", name: "Intensity", desc: "Stimulus intensity from 0 to 1.", type: "number", initialValue: "0" },
    { id: "x", name: "X", desc: "Stimulus X position.", type: "number", initialValue: "0" },
    { id: "y", name: "Y", desc: "Stimulus Y position.", type: "number", initialValue: "0" },
  ],
};

export const expose = true;

export default function (agentUID, stimulusType, intensity, x, y) {
  return this._addStimulus(agentUID, stimulusType, intensity, x, y, "{}");
}