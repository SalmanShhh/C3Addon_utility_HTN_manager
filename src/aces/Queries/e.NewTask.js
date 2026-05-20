export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "New task after interruption. Use case: immediately start VFX for emergency reactions.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastNewTask;
}