export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Gets squad member UID at index. Use case: iterate members in a repeat loop.",
  params: [
    { id: "squadId", name: "Squad ID", desc: "Squad key string.", type: "string" },
    { id: "index", name: "Index", desc: "Zero-based index.", type: "number" },
  ],
};

export const expose = true;

export default function (squadId, index) {
  return this._getSquadAgentUIDByIndex(squadId, index);
}