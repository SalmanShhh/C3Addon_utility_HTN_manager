export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Set Squad State Key",
  displayText: "Set squad {0} state {1} to {2}",
  description: "Writes shared squad state. Use case: set tactic to flank_left for all members.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "key", name: "Key", desc: "State key name.", type: "string", initialValue: '"tactic"' },
    { id: "value", name: "Value", desc: "State value.", type: "any", initialValue: '"hold"' },
  ],
};

export const expose = true;

export default function (squadId, key, value) {
  return this._setSquadStateKey(squadId, key, value);
}