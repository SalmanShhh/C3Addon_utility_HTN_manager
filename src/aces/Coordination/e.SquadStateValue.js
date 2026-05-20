export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "any",
  description: "Reads one shared squad state key. Use case: followers read current tactic.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad key string.", type: "string" },
    { id: "key", name: "Key", desc: "Shared state key.", type: "string" },
  ],
};

export const expose = true;

export default function (squadId, key) {
  return this._getSquadStateValue(squadId, key);
}