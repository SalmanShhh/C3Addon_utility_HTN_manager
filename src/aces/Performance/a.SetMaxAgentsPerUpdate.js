export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Performance: Set Max Agents Per Update",
  displayText: "Set max agents per update to {0}",
  description: "Caps agents evaluated per update. Use case: smooth frame-time spikes with large NPC groups.",
  params: [
    {
      id: "count",
      name: "Count",
      desc: "0 means all agents; any other value is a per-update cap.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (count) {
  this._setMaxAgentsPerTick(count);
}