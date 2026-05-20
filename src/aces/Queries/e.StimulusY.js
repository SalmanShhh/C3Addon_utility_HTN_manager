export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Stimulus Y coordinate. Use case: mark a noise location on minimap.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastStimulusY;
}