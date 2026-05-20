export const config = {
  highlight: false,
  isDeprecated: false,
  isAsync: false,
  listName: "Coordination: Clear Squad State Key",
  displayText: "Clear squad {0} state {1}",
  description: "Removes one shared squad key. Use case: clear temporary rally point after regroup.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Target squad ID.", type: "string", initialValue: '"alpha"' },
    { id: "key", name: "Key", desc: "State key name.", type: "string", initialValue: '"rallyX"' },
  ],
};

export const expose = true;

export default function (squadId, key) {
  return this._clearSquadStateKey(squadId, key);
}