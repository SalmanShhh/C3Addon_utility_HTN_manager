export const config = {
  highlight: false,
  isDeprecated: false,
  returnType: "string",
  description: "Stimulus type string from trigger context. Use case: react differently to sound vs visual cues.",
  params: [],
};

export const expose = true;

export default function () {
  return this._lastStimulusType;
}