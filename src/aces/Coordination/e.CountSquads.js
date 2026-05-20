export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Counts active squads. Use case: monitor coordination load.",
  params: [],
};

export const expose = true;

export default function () {
  return this._countSquads();
}