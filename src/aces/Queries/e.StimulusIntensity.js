export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "number",
  description: "Stimulus intensity value. Use case: scale reaction speed by how strong the event was.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastStimulusIntensity;
}