export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Gets leader UID for a squad. Use case: route leader-only commands.",
  params: [{ id: "squadId", name: "Squad ID", desc: "Squad key string.", type: "string" }],
};

export const expose = true;

export default function (squadId) {
  return this._getSquadLeader(squadId);
}