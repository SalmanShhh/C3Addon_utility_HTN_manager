export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Setup: Set Global State Key",
  displayText: "Set global state {0} to {1}",
  description: "Sets a value shared by all agents. Use case: toggle a global alarm state.",
  params: [
    { id: "key", name: "Key", desc: "Global state key to set.", type: "string", initialValue: '""' },
    { id: "value", name: "Value", desc: "Value to store.", type: "any", initialValue: "0" },
  ],
};

export const expose = true;

export default function (key, value) {
  return this._setGlobalStateKey(key, value);
}