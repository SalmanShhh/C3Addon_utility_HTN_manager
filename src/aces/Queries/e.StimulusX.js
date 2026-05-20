export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Stimulus X coordinate. Use case: send NPC to investigate that position.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastStimulusX;
}