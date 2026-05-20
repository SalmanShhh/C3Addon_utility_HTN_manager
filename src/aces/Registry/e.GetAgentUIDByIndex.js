export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Gets agent UID by list index. Use case: loop through all managed agents.",
  params: [{ id: "index", name: "Index", desc: "Zero-based agent index.", type: "number" }],
};

export const expose = true;

export default function (index) {
  return this._getAgentUIDByIndex(index);
}