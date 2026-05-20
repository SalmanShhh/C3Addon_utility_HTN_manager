export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "any",
  description: "Reads one shared global-state value. Use case: branch logic when global alarm is active.",
  params: [{ id: "key", name: "Key", desc: "Global state key.", type: "string" }],
};

export const expose = true;

export default function (key) {
  return this._globalState[String(key)] ?? 0;
}