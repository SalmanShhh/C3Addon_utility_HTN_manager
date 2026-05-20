export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Counts members in a squad. Use case: detect when reinforcements are needed.",
  params: [{ id: "squadId", name: "Squad ID", desc: "Squad key string.", type: "string" }],
};

export const expose = true;

export default function (squadId) {
  return this._countSquadAgents(squadId);
}